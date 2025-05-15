// 예매 내역 로드
function loadReservations() {
  const user = getCurrentUserInfo();
  if (!user) return;

  const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
  const userReservations = reservations.filter(
    (r) => r.userId === user.username
  );
  const reservationList = $("#reservation-list");
  reservationList.empty();

  if (userReservations.length === 0) {
    reservationList.html("<p>예매 내역이 없습니다.</p>");
    return;
  }

  userReservations.forEach((reservation) => {
    const date = new Date(reservation.date).toLocaleDateString();
    const reservationDiv = $(`
            <div class="reservation-item">
                <h3>${reservation.movie.title}</h3>
                <div class="reservation-details">
                    <p>극장: ${reservation.theater}</p>
                    <p>상영시간: ${reservation.time}</p>
                    <p>좌석: ${reservation.seats.join(", ")}</p>
                    <p>결제금액: ${reservation.totalPrice.toLocaleString()}원</p>
                    <p>예매일: ${date}</p>
                </div>
            </div>
        `);
    reservationList.append(reservationDiv);
  });
}

// 페이지 로드 시 실행
$(document).ready(function () {
  $("#header-container").load("header.html", function () {
    updateUserInterface(); // user.js에 정의된 함수
  });
  // 사용자 정보 표시
  displayUserInfo();
  // 예매 내역 표시
  displayReservations();
  // 포인트 충전 이벤트 리스너 등록
  setupPointCharge();
});

function updateHeader() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    // 로그인 상태일 때
    const userInfo = `${currentUser.name}님 (보유 포인트: ${currentUser.points}P)`;
    $("#user-info").text(userInfo);

    // 로그인/회원가입 링크를 로그아웃/마이페이지로 변경
    const $ul = $("#header-logo ul");
    $ul.empty();
    $ul.append('<li><a href="mypage.html">마이페이지</a></li>');
    $ul.append(
      '<li><a href="#" onclick="logout(); return false;">로그아웃</a></li>'
    );
  } else {
    // 로그인 상태가 아닐 때
    $("#user-info").empty();

    // 로그아웃/마이페이지 링크를 로그인/회원가입으로 변경
    const $ul = $("#header-logo ul");
    $ul.empty();
    $ul.append('<li><a href="login.html">로그인</a></li>');
    $ul.append('<li><a href="signup.html">회원가입</a></li>');
  }
}

function displayUserInfo() {
  const user = getCurrentUserInfo();
  if (user) {
    $("#username").text(user.username);
    $("#email").text(user.email);
    $("#points").text(user.points + "P");
  } else {
    window.location.href = "login.html";
  }
}

// 예매 내역 표시
function displayReservations() {
  const user = getCurrentUser();
  if (!user) return;

  const reservations = getUserReservations(user);

  const reservationList = $("#reservation-list");
  reservationList.empty();

  if (reservations.length === 0) {
    reservationList.append(
      '<p class="no-reservation">예매 내역이 없습니다.</p>'
    );
    return;
  }

  reservations.forEach((reservation) => {
    const reservationItem = $(`
            <div class="reservation-item">
                <div class="reservation-info">
                    <h3>${reservation.movie.title}</h3>
                    <p>극장: ${reservation.theater}</p>
                    <p>상영시간: ${reservation.time}</p>
                    <p>좌석: ${reservation.seats.join(", ")}</p>
                    <p>결제금액: ${reservation.totalPrice.toLocaleString()}원</p>
                    <p>예매일시: ${new Date(
                      reservation.date
                    ).toLocaleString()}</p>
                </div>
            </div>
        `);
    reservationList.append(reservationItem);
  });
}

// 포인트 충전 이벤트 리스너 설정
function setupPointCharge() {
  $("#charge-points").on("click", function () {
    const pointCode = $("#point-code").val().trim();

    if (!pointCode) {
      alert("포인트 충전 코드를 입력해주세요.");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      location.href = "login.html";
      return;
    }
    // user가 문자열이라면 그대로 사용, 객체면 user.username 사용
    const username = typeof user === "string" ? user : user.username;
    //console.log(pointCode);
    if (chargePoints(username, pointCode)) {
      alert("포인트가 충전되었습니다.");
      $("#point-code").val("");
      displayUserInfo(); // 사용자 정보 새로고침
    } else {
      alert(
        "유효하지 않은 포인트 충전 코드입니다.\n\n사용 가능한 코드:\nPOINT10000: 1만 포인트\nPOINT100000: 10만 포인트"
      );
    }
  });
}

function getUserReservations(userId) {
  const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
  return reservations.filter((reservation) => reservation.userId === userId);
}
