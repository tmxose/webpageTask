// 예매 관련 상수
const TICKET_PRICE = 12000; // 티켓 가격
const SEATS_PER_ROW = 10; // 한 줄당 좌석 수
const TOTAL_ROWS = 8; // 총 좌석 줄 수

// 예매 상태 저장
let reservationState = {
  region: null,
  theater: null,
  movie: null,
  time: null,
  seats: [],
  personCount: 1,
};

let currentReserveInfo = {
  movieTitle: "",
  theater: "",
  time: "",
  personCount: 1,
};

// 페이지 로드 시 실행
$(document).ready(function () {
  // 로그인 체크
  if (!getCurrentUser()) {
    alert("로그인 후 이용해주세요.");
    location.href = "login.html";
    return;
  }

  // 초기 상태 설정
  $("#next-to-seat").prop("disabled", true);

  // 영화 목록 로드
  loadMovies(); // 동적으로 영화 목록 로드

  // URL 파라미터에서 영화 정보 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("movieId");
  const movieTitle = urlParams.get("title");
  const moviePoster = urlParams.get("poster");

  if (movieId && movieTitle && moviePoster) {
    reservationState.movie = {
      id: movieId,
      title: movieTitle,
      poster: moviePoster,
    };
    $(`.movie-item[data-movie-id="${movieId}"]`).addClass("selected");
  }

  // 지역 탭 이벤트
  $(".region-tab").click(function () {
    $(".region-tab").removeClass("active");
    $(this).addClass("active");
    reservationState.region = $(this).data("region");
    loadTheaters(reservationState.region);
  });

  // 영화관 선택 이벤트
  $(".theater-item").click(function () {
    $(".theater-item").removeClass("selected");
    $(this).addClass("selected");
    reservationState.theater = $(this).data("theater");
    checkNextButtonState();
  });

  // 인원 선택 이벤트
  $(".count-btn").click(function () {
    const action = $(this).hasClass("minus") ? "decrease" : "increase";
    if (action === "decrease" && reservationState.personCount > 1) {
      reservationState.personCount--;
    } else if (action === "increase" && reservationState.personCount < 8) {
      reservationState.personCount++;
    }
    $("#person-count").text(reservationState.personCount);
    updateTotalPrice();
  });

  // 다음 버튼 클릭 이벤트
  $("#next-to-seat").click(function () {
    if (!$(this).prop("disabled")) {
      // 1) 현재 선택된 정보를 reservationState에서 바로 읽어서 업데이트
      showSelectedInfo(
        reservationState.movie.title,
        reservationState.theater,
        reservationState.time,
        reservationState.personCount
      );

      // 2) 섹션 전환
      $(".reserve-section").hide();
      $("#seat-selection").show();

      // 3) 좌석 로드
      loadSeats();
    }
  });

  // 이전 버튼 클릭 이벤트
  $("#prev-to-movie").click(function () {
    $("#seat-selection").hide();
    $(".reserve-section").first().show();
  });

  // 예매 완료 버튼 클릭 이벤트
  $("#complete-reservation").click(function () {
    if (!$(this).prop("disabled")) {
      completeReservation();
    }
  });
});

// 극장 목록 로드
function loadTheaters(region) {
  // 실제 구현에서는 서버에서 데이터를 가져와야 함
  const theaters = {
    seoul: ["강남점", "강변점", "건대입구점", "구로점"],
    gyeonggi: ["고양스타필드점", "광명점", "광명아울렛점"],
    incheon: ["인천점", "인천공항점", "인천터미널점"],
    busan: ["부산점", "해운대점", "센텀시티점"],
  };

  const theaterList = $(".theater-list");
  theaterList.empty();

  theaters[region].forEach((theater) => {
    const theaterDiv = $(`<div class="theater-item">${theater}</div>`);
    theaterDiv.on("click", function () {
      $(".theater-item").removeClass("selected");
      $(this).addClass("selected");
      reservationState.theater = theater;
      checkNextButtonState();
    });
    theaterList.append(theaterDiv);
  });
  //   여기를 추가
  const firstTh = theaterList.find(".theater-item").first();
  if (firstTh.length) {
    firstTh.addClass("selected");
    reservationState.theater = firstTh.text(); // 또는 .data('theater')
    checkNextButtonState();
  }
}

// 영화 목록 및 시간표 로드
function loadMovies() {
  const movies = [
    { id: 1, title: "진격의 거인", poster: "movie1.png" },
    { id: 2, title: "미키17", poster: "movie2.jpg" },
    { id: 3, title: "침범", poster: "movie3.jpg" },
    { id: 4, title: "콘클라베", poster: "movie4.jpg" },

    { id: 5, title: "로비", poster: "movie5.jpg" },
    { id: 6, title: "기동전사 건담 지쿠악스 비기닝", poster: "movie6.jpg" },
    { id: 7, title: "아마추어", poster: "movie7.jpg" },
    { id: 8, title: "배러맨", poster: "movie8.jpg" },
  ];

  const movieList = $(".movie-list");
  movieList.empty();

  movies.forEach((movie) => {
    const movieDiv = $(`
            <div class="movie-item" data-movie-id="${movie.id}">
                <div class="movie-poster">
                    <img src="../assets/images/movie/${movie.poster}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="time-table"></div>
                </div>
            </div>
        `);

    // 1) 영화 클릭 핸들러: 영화 선택, 이전 시간 초기화
    movieDiv.on("click", () => {
      // 영화 선택 표시
      $(".movie-item").removeClass("selected");
      movieDiv.addClass("selected");
      // 상태 초기화
      reservationState.movie = movie;
      reservationState.time = null;
      // 모든 시간 선택 해제
      $(".time-item").removeClass("selected");
      checkNextButtonState();
    });

    // 2) 시간 버튼 생성 & 클릭 핸들러
    const times = ["10:00", "13:00", "16:00", "19:00", "22:00"];
    times.forEach((time, idx) => {
      const btn = $(`<div
                class="time-item"
                data-time="${time}"
                id="time-${movie.id}-${idx}"
            >${time}</div>`);

      btn.on("click", (e) => {
        e.stopPropagation(); // 영화 클릭 이벤트 방지

        // 기존 모든 시간 선택 해제 (다른 영화 포함)
        $(".time-item").removeClass("selected");
        // 클릭된 버튼만 selected
        btn.addClass("selected");

        // 클릭된 영화도 selected 표시
        $(".movie-item").removeClass("selected");
        movieDiv.addClass("selected");

        // 상태 저장
        reservationState.movie = movie;
        reservationState.time = time;
        checkNextButtonState();
      });

      movieDiv.find(".time-table").append(btn);
    });

    movieList.append(movieDiv);
  });
}

// 좌석 로드
function loadSeats() {
  const seatContainer = $(".seat-container");
  seatContainer.empty();

  // 좌석 데이터 로드 (실제 구현에서는 서버에서 가져와야 함)
  const reservedSeats = getReservedSeats();

  for (let row = 0; row < TOTAL_ROWS; row++) {
    const rowDiv = $('<div class="seat-row"></div>');
    for (let col = 0; col < SEATS_PER_ROW; col++) {
      const seatId = `${row}-${col}`;
      const isReserved = reservedSeats.includes(seatId);
      const seatDiv = $(`
                <div class="seat ${isReserved ? "reserved" : ""}" 
                     data-seat-id="${seatId}">
                    ${isReserved ? "X" : ""}
                </div>
            `);

      if (!isReserved) {
        seatDiv.on("click", function () {
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
  const seatId = seatElement.data("seat-id");
  const index = reservationState.seats.indexOf(seatId);

  if (index === -1) {
    if (reservationState.seats.length < reservationState.personCount) {
      seatElement.addClass("selected");
      reservationState.seats.push(seatId);
    } else {
      alert("선택한 인원 수만큼만 좌석을 선택할 수 있습니다.");
      return;
    }
  } else {
    seatElement.removeClass("selected");
    reservationState.seats.splice(index, 1);
  }

  updateSeatInfo();
}

// 좌석 정보 업데이트
function updateSeatInfo() {
  const totalPrice = reservationState.seats.length * TICKET_PRICE;
  $(".selected-seats").text(
    `선택한 좌석: ${reservationState.seats.join(", ")}`
  );
  $(".total-price").text(`총 금액: ${totalPrice.toLocaleString()}원`);
  $("#complete-reservation").prop(
    "disabled",
    reservationState.seats.length === 0
  );
}

// 인원 수 업데이트
function updatePersonCount() {
  $("#person-count").text(reservationState.personCount);
  if (reservationState.seats.length > reservationState.personCount) {
    // 선택된 좌석이 인원 수보다 많으면 초과분 제거
    const excessSeats = reservationState.seats.slice(
      reservationState.personCount
    );
    excessSeats.forEach((seatId) => {
      $(`.seat[data-seat-id="${seatId}"]`).removeClass("selected");
    });
    reservationState.seats = reservationState.seats.slice(
      0,
      reservationState.personCount
    );
    updateSeatInfo();
  }
}

// 예매 완료
function completeReservation() {
  const user = getCurrentUserInfo();
  const totalPrice = reservationState.seats.length * TICKET_PRICE;

  if (user.points < totalPrice) {
    alert(
      "포인트가 부족합니다. 마이페이지에서 포인트를 충전해주세요.\n\n포인트 충전 코드:\nPOINT10000: 1만 포인트\nPOINT100000: 10만 포인트"
    );
    location.href = "mypage.html";
    return;
  }

  // 예매 정보 저장
  const reservation = {
    userId: user.username,
    theater: reservationState.theater,
    movie: reservationState.movie,
    time: reservationState.time,
    seats: reservationState.seats,
    totalPrice: totalPrice,
    date: new Date().toISOString(),
  };

  // 예매 정보 저장 (실제 구현에서는 서버에 저장해야 함)
  saveReservation(reservation);

  // 포인트 차감
  user.points -= totalPrice;
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.username === user.username);
  users[userIndex] = user;
  saveUsers(users);

  alert("예매가 완료되었습니다!");
  location.href = "mypage.html";
}

// 예매 정보 저장
function saveReservation(reservation) {
  const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
  reservations.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

// 예매된 좌석 정보 가져오기
function getReservedSeats() {
  const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
  return reservations
    .filter(
      (r) =>
        r.theater === reservationState.theater &&
        r.movie.id === reservationState.movie.id &&
        r.time === reservationState.time
    )
    .flatMap((r) => r.seats);
}

// 좌석 생성 함수
function createSeats() {
  const seatContainer = $(".seat-container");
  seatContainer.empty();

  // A부터 J까지의 행 생성
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  rows.forEach((row) => {
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
        seat.addClass("reserved");
      }

      seat.on("click", function () {
        if (!$(this).hasClass("reserved")) {
          $(this).toggleClass("selected");
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
  const selectedSeats = $(".seat.selected");
  const selectedSeatsContainer = $(".selected-seats");
  const totalPrice = $(".total-price");

  selectedSeatsContainer.empty();
  selectedSeats.each(function () {
    const seatSpan = $(`<span>${$(this).data("seat")}</span>`);
    selectedSeatsContainer.append(seatSpan);
  });

  const price = selectedSeats.length * 10000; // 1인당 10,000원
  totalPrice.text(`총 금액: ${price.toLocaleString()}원`);

  // 예매하기 버튼 활성화/비활성화
  $("#complete-reservation").prop("disabled", selectedSeats.length === 0);
}

// 상영관 정보 업데이트
function updateTheaterInfo(movieTitle, theaterNumber, showtime) {
  let theaterInfo = document.querySelector(".theater-info");
  if (theaterInfo) {
    //theaterInfo.querySelector('.movie-title').textContent = movieTitle;
    theaterInfo.querySelector(
      ".theater-number"
    ).textContent = `${theaterNumber}관`;
    theaterInfo.querySelector(".showtime").textContent = showtime;
  } else {
    console.error("Theater info element not found.");
  }
}

// 선택된 정보 표시 함수
function showSelectedInfo(movieTitle, theater, time, personCount) {
  $(".selected-movie-info .movie-info-title").text(movieTitle);
  $(".selected-movie-info .theater-number").text(`${theater}관`);
  $(".selected-movie-info .showtime").text(time);
  $(".selected-movie-info .person-count-info").text(`인원: ${personCount}명`);

  // currentReserveInfo 객체 업데이트
  currentReserveInfo.movieTitle = movieTitle;
  currentReserveInfo.theater = theater;
  currentReserveInfo.time = time;
  currentReserveInfo.personCount = personCount;
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  // 지역 탭 클릭 이벤트
  $(".region-tab").click(function () {
    $(".region-tab").removeClass("active");
    $(this).addClass("active");
    reservationState.region = $(this).data("region");
    loadTheaters(reservationState.region);
  });

  // 영화관 선택 이벤트
  $(".theater-item").click(function () {
    $(".theater-item").removeClass("selected");
    $(this).addClass("selected");
    reservationState.theater = $(this).data("theater");
    checkNextButtonState();
  });

  // 이전 버튼 이벤트 리스너
  document.getElementById("prev-to-region").addEventListener("click", () => {
    const movieSelection = document.getElementById("movie-selection");
    const regionSelection = document.getElementById("region-selection");

    if (movieSelection && regionSelection) {
      movieSelection.style.display = "none";
      regionSelection.style.display = "block";
    }
  });

  document.getElementById("prev-to-movie").addEventListener("click", () => {
    const seatSelection = document.getElementById("seat-selection");
    const movieSelection = document.getElementById("movie-selection");

    if (seatSelection && movieSelection) {
      seatSelection.style.display = "none";
      movieSelection.style.display = "block";
    }
  });
});

// 선택된 영화 정보 표시
function showSelectedMovieInfo() {
  $(".selected-movie-info .movie-title").text(reservationState.movie.title);
  $(".selected-movie-info .person-count-info").text(
    `인원: ${reservationState.personCount}명`
  );
  $(".theater-info .theater-number").text(`${reservationState.theater}관`);
  $(".theater-info .showtime").text(reservationState.time);
}

// 다음 버튼 상태 확인
function checkNextButtonState() {
  // console.log(
  //   "현재 상태 →",
  //   "region:",
  //   reservationState.region,
  //   "theater:",
  //   reservationState.theater,
  //   "movie:",
  //   reservationState.movie ? reservationState.movie.title : null,
  //   "time:",
  //   reservationState.time
  // );
  const nextBtn = $("#next-to-seat");
  if (
    reservationState.theater &&
    reservationState.movie &&
    reservationState.time
  ) {
    nextBtn.prop("disabled", false);
  } else {
    nextBtn.prop("disabled", true);
  }
}

// 총 가격 업데이트
function updateTotalPrice() {
  const totalPrice = TICKET_PRICE * reservationState.personCount;
  $(".total-price").text(`총 금액: ${totalPrice.toLocaleString()}원`);
}
