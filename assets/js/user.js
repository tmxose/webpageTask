// user.js

// 사용자 관련 상수
const POINT_CODES = {
  POINT1000: 1000,
  POINT10000: 10000, // 1만 포인트 충전 코드
  POINT100000: 100000, // 10만 포인트 충전 코드
};

//  전체 사용자 데이터 저장
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

//   전체 사용자 데이터 가져오기
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

//   로그인한 사용자 ID 저장
function setCurrentUser(username) {
  sessionStorage.setItem("currentUser", username);
  sessionStorage.setItem("isLoggedIn", "true");
}

//   로그인한 사용자 ID 가져오기
function getCurrentUser() {
  return sessionStorage.getItem("currentUser");
}

//   로그인한 사용자 정보 가져오기 (항상 객체 반환)
function getCurrentUserInfo() {
  const users = getUsers();
  const currentUserId = getCurrentUser();
  return users.find((u) => u.username === currentUserId);
}

//   회원가입 함수
function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  // 입력값 유효성 검사
  if (!username || !password || !name || !email) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("올바른 이메일 형식을 입력해주세요.");
    return;
  }

  // 비밀번호 길이 검사
  if (password.length < 6) {
    alert("비밀번호는 6자 이상이어야 합니다.");
    return;
  }

  const users = getUsers();

  // 아이디 중복 체크
  if (users.some((u) => u.username === username)) {
    alert("이미 존재하는 아이디입니다.");
    return;
  }

  // 새 사용자 추가
  const newUser = {
    username,
    password,
    name,
    email,
    points: 0,
    reservations: []
  };

  users.push(newUser);
  saveUsers(users);

  alert("회원가입 완료! 로그인 페이지로 이동합니다.");
  location.href = "/pages/login.html";
}

//   로그인 함수
function login() {
  const id = document.getElementById("login-id").value;
  const pw = document.getElementById("login-pw").value;

  const users = getUsers();
  const user = users.find((u) => u.username === id && u.password === pw);
  if (user) {
    setCurrentUser(id);
    alert("로그인 성공!");
    location.href = "./index.html";
  } else {
    alert("아이디 또는 비밀번호가 틀렸습니다.");
  }
}

//   사용자 정보 업데이트 함수 (ex: 마이페이지에서 사용)
function updateUserInfo() {
  const user = getCurrentUserInfo();
  const infoP = document.getElementById("info");

  if (user && infoP) {
    infoP.innerHTML = `환영합니다, ${user.name}님 (보유 포인트: ${user.points}P)`;
  }
}
//   로그아웃 함수
function logout() {
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("currentUser");
  alert("로그아웃되었습니다.");
  location.href = "./index.html";
}


// 헤더의 사용자 인터페이스 업데이트
function updateUserInterface() {
    const headerLogo = document.querySelector("#header-logo");
    const user = getCurrentUserInfo();
    
    if (user && headerLogo) {
        // 로그인 상태일 때
        const userInfoDiv = headerLogo.querySelector("#user-info");
        const loginUl = headerLogo.querySelector("ul");
        
        if (userInfoDiv) {
            userInfoDiv.innerText = `환영합니다, ${user.name}님 (보유 포인트: ${user.points}P)`;
        }
        
        if (loginUl) {
            loginUl.innerHTML = `
                <li><a href="mypage.html">마이페이지</a></li>
                <li><a href="#" onclick="logout()">로그아웃</a></li>
            `;
        }
    } else if (headerLogo) {
        // 비로그인 상태일 때
        const userInfoDiv = headerLogo.querySelector("#user-info");
        const loginUl = headerLogo.querySelector("ul");
        
        if (userInfoDiv) {
            userInfoDiv.innerText = "";
        }
        
        if (loginUl) {
            loginUl.innerHTML = `
                <li><a href="login.html">로그인</a></li>
                <li><a href="signup.html">회원가입</a></li>
            `;
        }
    }
}

// DOM이 로드되면 UI 업데이트
document.addEventListener("DOMContentLoaded", function() {
    updateUserInterface();
});

// 포인트 충전
function chargePoints(username, pointCode) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) return false;

  // 포인트 코드 검증
  if (!(pointCode in POINT_CODES)) {
    return false;
  }

  // 포인트 충전
  const points = POINT_CODES[pointCode];
  users[userIndex].points = (users[userIndex].points || 0) + points;
  saveUsers(users);
  return true;
}

// 포인트 충전 코드 확인
function validatePointCode(code) {
  return POINT_CODES.hasOwnProperty(code);
}

// 회원가입 처리
function signup(username, password, email) {
  const users = getUsers();

  // 이미 존재하는 사용자인지 확인
  if (users.some((user) => user.username === username)) {
    return false;
  }

  // 새 사용자 추가
  users.push({
    username,
    password,
    email,
    points: 0,
    reservations: [],
  });

  saveUsers(users);
  return true;
}

// 예매 정보 저장
function saveReservation(reservation) {
  const users = getUsers();
  const userIndex = users.findIndex(
    (user) => user.username === reservation.userId
  );

  if (userIndex !== -1) {
    if (!users[userIndex].reservations) {
      users[userIndex].reservations = [];
    }
    users[userIndex].reservations.push(reservation);
    saveUsers(users);
    return true;
  }
  return false;
}

// 사용자의 예매 내역 가져오기
function getUserReservations(username) {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  return user ? (user.reservations || []) : [];
}

// 로그인 상태 체크
function checkLoginStatus() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    location.href = "/pages/login.html";
    return false;
  }
  return true;
}

// 네비게이션 동적 렌더링
function renderNavLinks() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;
  navLinks.innerHTML = "";
  navLinks.innerHTML += '<li><a href="index.html">홈</a></li>';
  navLinks.innerHTML += '<li><a href="reserve.html">예매</a></li>';
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    navLinks.innerHTML += '<li><a href="mypage.html">마이페이지</a></li>';
    navLinks.innerHTML +=
      '<li><a href="#" onclick="logout()">로그아웃</a></li>';
  } else {
    navLinks.innerHTML += '<li><a href="login.html">로그인</a></li>';
  }
}

document.addEventListener("DOMContentLoaded", renderNavLinks);

// 특정 사용자 삭제 함수
function deleteUser(username) {
  const users = getUsers();
  const updatedUsers = users.filter((user) => user.username !== username);
  saveUsers(updatedUsers);
  return true;
}

// 관리자용 전체 사용자 목록 조회 함수
function getAllUsers() {
  return getUsers();
}
