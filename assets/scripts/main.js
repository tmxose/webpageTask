// 상수 정의
const ANIMATION = {
    DURATION: 1000,
    NOTICE_DELAY: 5000,
    AD_DELAY: 10000,
    NOTICE_HEIGHT: 40,
    SLIDE_WIDTH: 20
};

// 헤더 로드 최적화
$(document).ready(function() {
    // 페이지 로드 전에 헤더를 미리 로드
    const headerContent = sessionStorage.getItem('headerContent');
    
    if (headerContent) {
        // 저장된 헤더가 있으면 바로 사용
        $("#header-container").html(headerContent);
    } else {
        // 없으면 새로 로드하고 저장
        $("#header-container").load("header.html", function() {
            sessionStorage.setItem('headerContent', $("#header-container").html());
        });
    }
});

  // 공지사항 자동 스크롤
$(document).ready(function() {
    const $noticeList = $(".notice-list");
    const $notices = $(".notice-list li");
    
    // 예외 처리
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
});

// 광고 슬라이드
$(document).ready(function() {
    const $adContainer = $(".ad-container");
    const $adList = $(".ad-list");
    const $ads = $(".ad-list img");
    
    // 예외 처리
    if (!$adList.length || !$ads.length) return;
    
    let adIndex = 0;
    let slideInterval;

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

    // 자동 슬라이드 시작
    function startSlide() {
        slideInterval = setInterval(moveSlide, ANIMATION.AD_DELAY);
    }

    // 초기 실행
    moveSlide();  // 첫 번째 슬라이드 시작
    startSlide(); // 자동 슬라이드 시작
});

// 현재 상영작과 상영 예정작 토글
$(document).ready(function() {
    const $movieTabs = $('.movies-type a');
    const $nowShowing = $('.now-showing');
    const $upcomingShowing = $('.upcoming-showing');
    
    // 예외 처리
    if (!$movieTabs.length || !$nowShowing.length || !$upcomingShowing.length) return;
    
    $movieTabs.on('click', function(e) {
        e.preventDefault();
        
        // 모든 탭에서 active 클래스 제거
        $movieTabs.removeClass('active');
        
        // 클릭된 탭에 active 클래스 추가
        $(this).addClass('active');
        
        // 해당하는 섹션 표시
        if ($(this).data('type') === 'now') {
            $nowShowing.addClass('active');
            $upcomingShowing.removeClass('active');
        } else {
            $upcomingShowing.addClass('active');
            $nowShowing.removeClass('active');
        }
    });
});

function moveToMain(){
    location.href = "main.html";
}