// 예매 관련 상수
const TICKET_PRICE = 10000; // 티켓 가격
const SEATS_PER_ROW = 10;   // 한 줄당 좌석 수
const TOTAL_ROWS = 8;       // 총 좌석 줄 수

// 예매 상태 저장
let reservationState = {
    selectedRegion: null,
    selectedTheater: null,
    selectedMovie: null,
    selectedTime: null,
    selectedSeats: [],
    personCount: 1
};

// 페이지 로드 시 실행
$(document).ready(function() {
    // 로그인 체크
    if (!getCurrentUser()) {
        alert("로그인 후 이용해주세요.");
        location.href = "login.html";
        return;
    }

    initializeReservation();
});

// 예매 초기화
function initializeReservation() {
    // 지역 탭 이벤트
    $('.region-tab').on('click', function() {
        $('.region-tab').removeClass('active');
        $(this).addClass('active');
        reservationState.selectedRegion = $(this).data('region');
        loadTheaters(reservationState.selectedRegion);
    });

    // 다음 버튼 이벤트
    $('#next-to-movie').on('click', function() {
        if (reservationState.selectedTheater) {
            $('#region-selection').hide();
            $('#movie-selection').show();
            loadMovies();
        }
    });

    $('#next-to-seat').on('click', function() {
        if (reservationState.selectedMovie && reservationState.selectedTime) {
            $('#movie-selection').hide();
            $('#seat-selection').show();
            showSelectedMovieInfo();
            loadSeats();
        }
    });

    // 인원 선택 이벤트
    $('.count-btn.minus').on('click', function() {
        if (reservationState.personCount > 1) {
            reservationState.personCount--;
            updatePersonCount();
        }
    });

    $('.count-btn.plus').on('click', function() {
        if (reservationState.personCount < 8) {
            reservationState.personCount++;
            updatePersonCount();
        }
    });

    // 예매 완료 버튼
    $('#complete-reservation').on('click', completeReservation);
}

// 극장 목록 로드
function loadTheaters(region) {
    // 실제 구현에서는 서버에서 데이터를 가져와야 함
    const theaters = {
        'seoul': ['강남점', '강변점', '건대입구점', '구로점'],
        'gyeonggi': ['고양스타필드점', '광명점', '광명아울렛점'],
        'incheon': ['인천점', '인천공항점', '인천터미널점'],
        'busan': ['부산점', '해운대점', '센텀시티점']
    };

    const theaterList = $('.theater-list');
    theaterList.empty();

    theaters[region].forEach(theater => {
        const theaterDiv = $(`<div class="theater-item">${theater}</div>`);
        theaterDiv.on('click', function() {
            $('.theater-item').removeClass('selected');
            $(this).addClass('selected');
            reservationState.selectedTheater = theater;
            $('#next-to-movie').prop('disabled', false);
        });
        theaterList.append(theaterDiv);
    });
}

// 영화 목록 로드
function loadMovies() {
    // 실제 구현에서는 서버에서 데이터를 가져와야 함
    const movies = [
        { id: 1, title: '진격의 거인', poster: 'movie1.png' },
        { id: 2, title: '미키17', poster: 'movie2.jpg' },
        { id: 3, title: '침범', poster: 'movie3.jpg' },
        { id: 4, title: '콘클라베', poster: 'movie4.jpg' }
    ];

    const movieList = $('.movie-list');
    movieList.empty();

    movies.forEach(movie => {
        const movieDiv = $(`
            <div class="movie-item" data-movie-id="${movie.id}">
                <img src="assets/images/movie/${movie.poster}" alt="${movie.title}">
                <h3>${movie.title}</h3>
            </div>
        `);
        movieDiv.on('click', function() {
            $('.movie-item').removeClass('selected');
            $(this).addClass('selected');
            reservationState.selectedMovie = movie;
            loadTimeTable(movie.id);
        });
        movieList.append(movieDiv);
    });
}

// 상영 시간표 로드
function loadTimeTable(movieId) {
    // 실제 구현에서는 서버에서 데이터를 가져와야 함
    const times = ['10:00', '12:30', '15:00', '17:30', '20:00'];
    const timeTable = $('.time-table');
    timeTable.empty();

    times.forEach(time => {
        const timeDiv = $(`<div class="time-item">${time}</div>`);
        timeDiv.on('click', function() {
            $('.time-item').removeClass('selected');
            $(this).addClass('selected');
            reservationState.selectedTime = time;
            $('#next-to-seat').prop('disabled', false);
        });
        timeTable.append(timeDiv);
    });
}

// 좌석 로드
function loadSeats() {
    const seatContainer = $('.seat-container');
    seatContainer.empty();

    // 좌석 데이터 로드 (실제 구현에서는 서버에서 가져와야 함)
    const reservedSeats = getReservedSeats();

    for (let row = 0; row < TOTAL_ROWS; row++) {
        const rowDiv = $('<div class="seat-row"></div>');
        for (let col = 0; col < SEATS_PER_ROW; col++) {
            const seatId = `${row}-${col}`;
            const isReserved = reservedSeats.includes(seatId);
            const seatDiv = $(`
                <div class="seat ${isReserved ? 'reserved' : ''}" 
                     data-seat-id="${seatId}">
                    ${isReserved ? 'X' : ''}
                </div>
            `);
            
            if (!isReserved) {
                seatDiv.on('click', function() {
                    toggleSeatSelection($(this));
                });
            }
            
            rowDiv.append(seatDiv);
        }
        seatContainer.append(rowDiv);
    }
}

// 좌석 선택 토글
function toggleSeatSelection(seatElement) {
    const seatId = seatElement.data('seat-id');
    const index = reservationState.selectedSeats.indexOf(seatId);

    if (index === -1) {
        if (reservationState.selectedSeats.length < reservationState.personCount) {
            seatElement.addClass('selected');
            reservationState.selectedSeats.push(seatId);
        } else {
            alert('선택한 인원 수만큼만 좌석을 선택할 수 있습니다.');
            return;
        }
    } else {
        seatElement.removeClass('selected');
        reservationState.selectedSeats.splice(index, 1);
    }

    updateSeatInfo();
}

// 좌석 정보 업데이트
function updateSeatInfo() {
    const totalPrice = reservationState.selectedSeats.length * TICKET_PRICE;
    $('.selected-seats').text(`선택한 좌석: ${reservationState.selectedSeats.join(', ')}`);
    $('.total-price').text(`총 금액: ${totalPrice.toLocaleString()}원`);
    $('#complete-reservation').prop('disabled', reservationState.selectedSeats.length === 0);
}

// 인원 수 업데이트
function updatePersonCount() {
    $('#person-count').text(reservationState.personCount);
    if (reservationState.selectedSeats.length > reservationState.personCount) {
        // 선택된 좌석이 인원 수보다 많으면 초과분 제거
        const excessSeats = reservationState.selectedSeats.slice(reservationState.personCount);
        excessSeats.forEach(seatId => {
            $(`.seat[data-seat-id="${seatId}"]`).removeClass('selected');
        });
        reservationState.selectedSeats = reservationState.selectedSeats.slice(0, reservationState.personCount);
        updateSeatInfo();
    }
}

// 예매 완료
function completeReservation() {
    const user = getCurrentUserInfo();
    const totalPrice = reservationState.selectedSeats.length * TICKET_PRICE;

    if (user.points < totalPrice) {
        alert('포인트가 부족합니다. 마이페이지에서 포인트를 충전해주세요.\n\n포인트 충전 코드:\nPOINT10000: 1만 포인트\nPOINT100000: 10만 포인트');
        location.href = 'mypage.html';
        return;
    }

    // 예매 정보 저장
    const reservation = {
        userId: user.username,
        theater: reservationState.selectedTheater,
        movie: reservationState.selectedMovie,
        time: reservationState.selectedTime,
        seats: reservationState.selectedSeats,
        totalPrice: totalPrice,
        date: new Date().toISOString()
    };

    // 예매 정보 저장 (실제 구현에서는 서버에 저장해야 함)
    saveReservation(reservation);

    // 포인트 차감
    user.points -= totalPrice;
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === user.username);
    users[userIndex] = user;
    saveUsers(users);

    alert('예매가 완료되었습니다!');
    location.href = 'mypage.html';
}

// 예매 정보 저장
function saveReservation(reservation) {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

// 예매된 좌석 정보 가져오기
function getReservedSeats() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    return reservations
        .filter(r => r.theater === reservationState.selectedTheater && 
                     r.movie.id === reservationState.selectedMovie.id &&
                     r.time === reservationState.selectedTime)
        .flatMap(r => r.seats);
}

// 좌석 생성 함수
function createSeats() {
    const seatContainer = $('.seat-container');
    seatContainer.empty();
    
    // A부터 J까지의 행 생성
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    rows.forEach(row => {
        const seatRow = $('<div class="seat-row"></div>');
        
        // 1부터 12까지의 열 생성
        for (let col = 1; col <= 12; col++) {
            const seatNumber = `${row}${col}`;
            const seat = $(`
                <div class="seat" data-seat="${seatNumber}">
                    ${seatNumber}
                </div>
            `);
            
            // 랜덤으로 예약된 좌석 생성 (실제로는 서버에서 받아와야 함)
            if (Math.random() < 0.2) {
                seat.addClass('reserved');
            }
            
            seat.on('click', function() {
                if (!$(this).hasClass('reserved')) {
                    $(this).toggleClass('selected');
                    updateSelectedSeats();
                }
            });
            
            seatRow.append(seat);
        }
        
        seatContainer.append(seatRow);
    });
}

// 선택된 좌석 업데이트
function updateSelectedSeats() {
    const selectedSeats = $('.seat.selected');
    const selectedSeatsContainer = $('.selected-seats');
    const totalPrice = $('.total-price');
    
    selectedSeatsContainer.empty();
    selectedSeats.each(function() {
        const seatSpan = $(`<span>${$(this).data('seat')}</span>`);
        selectedSeatsContainer.append(seatSpan);
    });
    
    const price = selectedSeats.length * 10000; // 1인당 10,000원
    totalPrice.text(`총 금액: ${price.toLocaleString()}원`);
    
    // 예매하기 버튼 활성화/비활성화
    $('#complete-reservation').prop('disabled', selectedSeats.length === 0);
}

// 상영관 정보 업데이트
function updateTheaterInfo(movieTitle, theaterNumber, showtime) {
    const theaterInfo = document.querySelector('.theater-info');
    theaterInfo.querySelector('.movie-title').textContent = movieTitle;
    theaterInfo.querySelector('.theater-number').textContent = `${theaterNumber}관`;
    theaterInfo.querySelector('.showtime').textContent = showtime;
}

// 영화 선택 시 상영 시간표 업데이트
function updateShowtimes(movieId) {
    const timeTable = document.querySelector('.time-table');
    timeTable.innerHTML = '';
    
    // 실제로는 서버에서 받아와야 하는 데이터
    const showtimes = [
        { time: '10:00', theater: 1 },
        { time: '13:00', theater: 3 },
        { time: '16:00', theater: 5 },
        { time: '19:00', theater: 7 }
    ];
    
    showtimes.forEach(showtime => {
        const timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        timeItem.textContent = `${showtime.time} (${showtime.theater}관)`;
        
        timeItem.addEventListener('click', () => {
            document.querySelectorAll('.time-item').forEach(item => {
                item.classList.remove('selected');
            });
            timeItem.classList.add('selected');
            
            // 좌석 선택 섹션으로 이동
            document.getElementById('movie-selection').style.display = 'none';
            document.getElementById('seat-selection').style.display = 'block';
            
            // 상영관 정보 업데이트
            const movieTitle = document.querySelector('.movie-item.selected h3').textContent;
            updateTheaterInfo(movieTitle, showtime.theater, showtime.time);
            
            // 좌석 생성
            createSeats();
        });
        
        timeTable.appendChild(timeItem);
    });
}

// 이전 버튼 이벤트 리스너
document.getElementById('prev-to-region').addEventListener('click', () => {
    document.getElementById('movie-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'block';
});

document.getElementById('prev-to-movie').addEventListener('click', () => {
    document.getElementById('seat-selection').style.display = 'none';
    document.getElementById('movie-selection').style.display = 'block';
});

// 좌석 선택 섹션으로 이동 시 선택된 영화 정보 표시
function showSelectedMovieInfo() {
    const movieTitle = reservationState.selectedMovie.title;
    const personCount = reservationState.personCount;
    
    $('.selected-movie-info .movie-title').text(movieTitle);
    $('.selected-movie-info .person-count-info').text(`인원: ${personCount}명`);
} 