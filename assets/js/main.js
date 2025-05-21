// 상수 정의
const ANIMATION = {
    DURATION: 1000,
    NOTICE_DELAY: 5000,
    AD_DELAY: 10000,
    NOTICE_HEIGHT: 40,
    SLIDE_WIDTH: 20
};

// 공지사항 자동 스크롤 처리
function initNoticeScroll() {
    const $noticeList = $(".notice-list");
    const $notices = $(".notice-list li");
    
    if (!$noticeList.length || !$notices.length) return;
    
    let noticeIndex = 0;
    
    function moveNotice() {
        $noticeList.css({
            'transition': `transform ${ANIMATION.DURATION}ms ease-in-out`,
            'transform': `translateY(-${noticeIndex * ANIMATION.NOTICE_HEIGHT}px)`
        });

        setTimeout(() => {
            if (noticeIndex === $notices.length) {
                $noticeList.css({
                    'transition': 'none',
                    'transform': 'translateY(0)'
                });
                noticeIndex = 0;
            } else {
                noticeIndex++;
            }
        }, ANIMATION.DURATION);
    }

    moveNotice();
    setInterval(moveNotice, ANIMATION.NOTICE_DELAY);
}

// 광고 슬라이드 처리
function initAdSlide() {
    const $adList = $(".ad-list");
    const $ads = $(".ad-list img");
    
    if (!$adList.length || !$ads.length) return;
    
    let adIndex = 0;

    function moveSlide() {
        adIndex++;
        $adList.css({
            'transition': `transform ${ANIMATION.DURATION}ms ease-in-out`,
            'transform': `translateX(-${adIndex * ANIMATION.SLIDE_WIDTH}%)`
        });

        if (adIndex === $ads.length - 1) {
            setTimeout(() => {
                $adList.css({
                    'transition': 'none',
                    'transform': 'translateX(0)'
                });
                adIndex = 0;
            }, ANIMATION.DURATION);
        }
    }

    moveSlide();
    setInterval(moveSlide, ANIMATION.AD_DELAY);
}

// 영화 탭 전환 처리
function initMovieTabs() {
    const $movieTabs = $('.movies-type a');
    const $nowShowing = $('.now-showing');
    const $upcomingShowing = $('.upcoming-showing');
    
    if (!$movieTabs.length || !$nowShowing.length || !$upcomingShowing.length) return;
    
    $movieTabs.on('click', function(e) {
        e.preventDefault();
        
        $movieTabs.removeClass('active');
        $(this).addClass('active');
        
        if ($(this).data('type') === 'now') {
            $nowShowing.addClass('active');
            $upcomingShowing.removeClass('active');
        } else {
            $upcomingShowing.addClass('active');
            $nowShowing.removeClass('active');
        }
    });
}

// 영화 카드 클릭 이벤트 처리
function initMovieCardEvents() {
    $('.movie-card').click(function() {
        const movieId = $(this).data('movie-id');
        const movieTitle = $(this).find('.movie-title').text();
        const moviePoster = $(this).find('img').attr('src');
        
        location.href = `reserve.html?movieId=${movieId}&title=${encodeURIComponent(movieTitle)}&poster=${encodeURIComponent(moviePoster)}`;
    });

    $('.reserve-btn').click(function(e) {
        e.stopPropagation();
        const movieCard = $(this).closest('.movie-card');
        const movieId = movieCard.data('movie-id');
        const movieTitle = movieCard.find('.movie-title').text();
        const moviePoster = movieCard.find('img').attr('src');
        
        location.href = `reserve.html?movieId=${movieId}&title=${encodeURIComponent(movieTitle)}&poster=${encodeURIComponent(moviePoster)}`;
    });
}

// 페이지 초기화 함수
function initMainPage() {
    // 사용자 인터페이스 업데이트
    updateUserInterface();
    
    // 각 기능 초기화
    initNoticeScroll();
    initAdSlide();
    initMovieTabs();
    initMovieCardEvents();
}

// 페이지 이동 함수
function moveToMain() {
    location.href = "main.html";
}

// DOM이 로드되면 초기화
$(document).ready(initMainPage);