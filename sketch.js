let handPose;
let video;
let hands = [];
let frameImg; // PNG 框架图片

function preload() {
  // 加载 ml5.js 的 handPose 模型（注意大写 P）
  handPose = ml5.handPose();
  // 加载 PNG 图片，请确保 frame.png 在项目目录中
  frameImg = loadImage("frame.png");
}

function setup() {
  // 使用手机屏幕尺寸作为画布大小
  createCanvas(windowWidth, windowHeight);
  frameRate(15);
  
  // 使用后置摄像头，视频分辨率设为 640x480（较清晰）
  let constraints = {
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  };
  video = createCapture(constraints);
  video.hide();
  
  // 开始检测手部
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}

// 返回大拇指尖（索引4）的坐标
function getThumbPosition(hand) {
  let thumbTip = hand.keypoints[4];
  return { x: thumbTip.x, y: thumbTip.y };
}

function draw() {
  background(255);
  
  // 计算视频绘制区域，保持 640×480 原始宽高比
  let videoAspect = video.width / video.height;
  let canvasAspect = width / height;
  let drawX, drawY, drawW, drawH;
  if (canvasAspect > videoAspect) {
    // 画布较宽时：视频填满高度
    drawH = height;
    drawW = height * videoAspect;
    drawX = (width - drawW) / 2;
    drawY = 0;
  } else {
    // 画布较窄时：视频填满宽度
    drawW = width;
    drawH = width / videoAspect;
    drawX = 0;
    drawY = (height - drawH) / 2;
  }
  
  // 绘制视频（保持正确比例）
  image(video, drawX, drawY, drawW, drawH);
  
  if (hands.length > 0) {
    let hand = hands[0];
    let thumbPosition = getThumbPosition(hand);
    
    // 计算视频到画布的缩放因子
    let scaleX = drawW / video.width;
    let scaleY = drawH / video.height;
    
    // 转换大拇指坐标到画布坐标（加上绘制区域偏移量）
    let thumbX = thumbPosition.x * scaleX + drawX;
    let thumbY = thumbPosition.y * scaleY + drawY;

    // ---------------------------
    // 绘制 PNG 框架图：定位于大拇指的右边
    // ---------------------------
    let frameWidth = 800; // 设置 PNG 图像的宽度
    let frameHeight = 800; // 设置 PNG 图像的高度
    let frameX = thumbX + 10; // 大拇指的右边
    let frameY = thumbY - frameHeight / 2; // 居中对齐大拇指的 Y 位置

    push();
      resetMatrix();
      image(frameImg, frameX, frameY, frameWidth, frameHeight);
    pop();
    
  } else {
    // 未检测到手时，显示提示文字
    fill(0);
    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    text("请寻找春天", width / 2, height / 2);
  }
}
