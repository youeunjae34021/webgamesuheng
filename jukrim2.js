const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = 600;
const height = 600;
const centerX = width / 2;
const centerY = height / 2;

// 플레이어 설정
const player = {
  angle: 0,
  radius: 40,
  size: 10,
  color: "white", // 기본 색상
};

// 화살 설정
const arrows = [];
let arrowSpeed = 10;
const arrowInterval = 370;



// 게임 상태
let gameOver = false;
let lastArrowTime = 0;
let startTime = 0; // 게임 시작 시간
let survivalTime = 0; // 생존 시간
let isGameRunning = false; // 게임 실행 상태 확인 플래그
let isInvincible = false; // 무적 상태 여부
let lastInvincibleTime = 0; // 마지막 무적 시작 시간
const invincibleDuration = 1000; // 무적 지속 시간 (1초)
const invincibleCooldown = 4000; // 무적 쿨타임 (4초)

// 키 입력 상태
let leftPressed = false;
let rightPressed = false;

// 무지개 색상 배열
const rainbowColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
let rainbowIndex = 0; // 현재 무지개 색상 인덱스

// 플레이어 이름
let playerName = "Player";
const records = []; // 이름과 생존 시간을 저장할 배열

// 키 이벤트 리스너
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.code === "Space") activateInvincibility();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
});

// 무적 상태 활성화
function activateInvincibility() {
  const currentTime = Date.now();
  if (currentTime - lastInvincibleTime >= invincibleCooldown && !isInvincible) {
    isInvincible = true;
    lastInvincibleTime = currentTime;

    // 무적 상태 해제 타이머
    setTimeout(() => {
      isInvincible = false;
      player.color = "white"; // 색상 초기화
    }, invincibleDuration);
  }
}

// 화살 생성
function createArrow() {
  const angle = Math.random() * Math.PI * 2; // 무작위 방향
  arrows.push({
    angle: angle,
    x: centerX + Math.cos(angle) * (width / 2),
    y: centerY + Math.sin(angle) * (height / 2),
  });
}

// 화살 그리기
function drawArrows() {
  arrows.forEach((arrow, index) => {
    arrow.x -= Math.cos(arrow.angle) * arrowSpeed;
    arrow.y -= Math.sin(arrow.angle) * arrowSpeed;

    ctx.beginPath();
    ctx.arc(arrow.x, arrow.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // 화살과 플레이어 충돌 검사
    let dx = arrow.x - (centerX + Math.cos(player.angle) * player.radius);
    let dy = arrow.y - (centerY + Math.sin(player.angle) * player.radius);
    if (Math.sqrt(dx * dx + dy * dy) < player.size + 5 && !isInvincible) {
      gameOver = true;
      isGameRunning = false;
      records.push({ name: playerName, time: survivalTime.toFixed(2) });
    }

    // 화면 밖으로 나간 화살 제거
    if (
      arrow.x < 0 ||
      arrow.x > width ||
      arrow.y < 0 ||
      arrow.y > height
    ) {
      arrows.splice(index, 1);
    }
  });
}

// 플레이어 그리기
function drawPlayer() {
  const playerX = centerX + Math.cos(player.angle) * player.radius;
  const playerY = centerY + Math.sin(player.angle) * player.radius;

  // 무적 상태일 때 무지개 색상 적용
  if (isInvincible) {
    player.color = rainbowColors[rainbowIndex];
    rainbowIndex = (rainbowIndex + 1) % rainbowColors.length;
  }

  ctx.beginPath();
  ctx.arc(playerX, playerY, player.size, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

// 생존 시간 표시
function drawSurvivalTime() {
  ctx.font = "150px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.textAlign = "center";

  survivalTime = gameOver ? survivalTime : (Date.now() - startTime) / 1000;
  ctx.fillText(`${survivalTime.toFixed(2)}`, centerX, centerY);
}

// 쿨타임 표시
function drawCooldown() {
  const currentTime = Date.now();
  const timeSinceLastInvincible = currentTime - lastInvincibleTime;
  const cooldown = Math.max(0, (invincibleCooldown - timeSinceLastInvincible) / 1000);

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(`무적 되기: ${cooldown.toFixed(1)}`, centerX, height - 30);
}

// 기록 표시 영역 설정
const recordAreaWidth = 200;
const recordAreaHeight = 300;
const recordAreaX = width - 200;
const recordAreaY = 20;

// 기록 표시 함수 변경
function drawRecords() {
    const recordList = document.getElementById('recordList');
    recordList.innerHTML = ''; // 기존 목록 삭제
  
    records.forEach((record, index) => {
      const li = document.createElement('li');
      li.textContent = `${record.name}: ${record.time}s`;
      recordList.appendChild(li);
    });
  }

// 게임 화면 업데이트
function update() {
  ctx.clearRect(0, 0, width, height);

  // 원형 경계선
  ctx.beginPath();
  ctx.arc(centerX, centerY, player.radius, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // 키 입력에 따라 플레이어 회전
  if (leftPressed) player.angle -= 0.07;
  if (rightPressed) player.angle += 0.07;

  // 화살 생성
  const currentTime = Date.now();
  if (currentTime - lastArrowTime > arrowInterval) {
    createArrow();
    lastArrowTime = currentTime;
  }

  drawArrows();
  drawPlayer();
  drawSurvivalTime();
  drawCooldown();
  drawRecords();

  // 게임 오버 처리
  if (gameOver) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", centerX, centerY);
    isGameRunning = false; // 게임 루프 중지
  } else {
    requestAnimationFrame(update);
  }
}

// 버튼 클릭 이벤트
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
  if (isGameRunning) return; // 이미 게임이 실행 중이라면 무시

  // 이름 입력
  playerName = prompt("Enter your name:", "Player") || "Player";

  // 게임 상태 초기화
  gameOver = false;
  arrows.length = 0;
  player.angle = 0;
  arrowSpeed = 3;
  lastArrowTime = Date.now();
  startTime = Date.now();
  survivalTime = 0; // 생존 시간 초기화

  isGameRunning = true; // 게임 실행 상태 설정

  // 게임 루프 시작
  update();
});
