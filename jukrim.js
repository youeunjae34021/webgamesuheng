const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;

// 플레이어 설정
const player = {
  angle: 0,
  radius: 40,
  size: 10,
};

// 화살 설정
const arrows = [];
let arrowSpeed = 3;
const arrowInterval = 500;

// 게임 상태
let gameOver = false;
let lastArrowTime = 0;
let startTime = 0; // 게임 시작 시간
let survivalTime = 0; // 생존 시간
let isGameRunning = false; // 게임 실행 상태 확인 플래그

// 키 입력 상태
let leftPressed = false;
let rightPressed = false;
let parying = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Space") parying = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Space") parying =  false;
});

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
    if (Math.sqrt(dx * dx + dy * dy) < player.size + 5) {
      if (parying) {
          // 화살을 플레이어와 반대 방향으로 밀어내기
          arrow.x -= Math.cos(arrow.angle + Math.PI) * arrowSpeed; // 화살이 반대 방향으로 밀려나도록 수정
          arrow.y -= Math.sin(arrow.angle + Math.PI) * arrowSpeed; // 화살이 반대 방향으로 밀려나도록 수정
      } else {
          gameOver = true;
          isGameRunning = false;
      }
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

  ctx.beginPath();
  ctx.arc(playerX, playerY, player.size, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// 생존 시간 표시
function drawSurvivalTime() {
  ctx.font = "150px Arial";
  ctx.fillStyle ="rgba(255, 255, 255, 0.1)";
  ctx.textAlign = "left";
  

  survivalTime = gameOver ? survivalTime : (Date.now() - startTime) / 1000;
  ctx.fillText(`${survivalTime.toFixed(2)}`, width - 440, 350);
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
  if (leftPressed) player.angle -= 0.05;
  if (rightPressed) player.angle += 0.05;

  // 화살 생성
  const currentTime = Date.now();
  if (currentTime - lastArrowTime > arrowInterval) {
    createArrow();
    lastArrowTime = currentTime;
  }

  drawArrows();
  drawPlayer();
  drawSurvivalTime();

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
  if (isGameRunning) return; 


  gameOver = false;
  arrows.length = 0;
  player.angle = 0;
  arrowSpeed = 3;
  lastArrowTime = Date.now();
  startTime = Date.now();

  isGameRunning = true; 

  // 게임 시작
  update();
});
