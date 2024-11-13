let webcam;
let detector;

let videoFrame;

let state = 0;
// 0: main page  1: recording page  2: paused page  3: saved page

let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_person;
let stateIndicator = [];

let recordingTime = '00:00:00'; 
let recordingStartTime = 0;
let pausedStartTime = 0;
let pausedTime = 0;
let totalPausedTime = 0;

let myWriter;
let writerMsg='';

let detedtedObjects = [];

let peopleNumber = 0;

function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  videoFrame = loadImage('img/VideoPreview.png');
  
  btn_pause[0] = loadImage('img/pause_disabled.png');
  btn_pause[1] = loadImage('img/pause_activated.png');
  
  btn_record[0] = loadImage('img/record_disabled.png');
  btn_record[1] = loadImage('img/record_activated.png');
  btn_record[2] = loadImage('img/record_paused.png');
  btn_record[3] = loadImage('img/record_saved.png');
  
  btn_stop[0] = loadImage('img/stop_disabled.png');
  btn_stop[1] = loadImage('img/stop_activated.png');
  
  icon_person = loadImage('img/icon_person.png');
  
  stateIndicator[0] = loadImage('img/tapToRecord.png');
  stateIndicator[1] = loadImage('img/state_recording.png');
  stateIndicator[2] = loadImage('img/state_paused.png');
  stateIndicator[3] = loadImage('img/state_saved.png');
}

function setup() {
  createCanvas(320, 360);
  webcam = createCapture(VIDEO);
  webcam.size(320, 240);
  webcam.hide();
  
  detector.detect(webcam, gotDetections);
  
  
}

function draw() {
  background(0);
  
  calculateRecordingTime();
  
  drawStatusBar(state);
  drawVideoPreview(0,22,320,240);
  drawCounter(state);
  drawStateIndicator(state);
  drawButtons(state);
  writeLog(state);
  
  peopleNumber = 0;
}

//==================== 1.Draw Video Preview
function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
  doCOCOSSD();
  image(videoFrame, x, y, w, h);
}
//==================== 2.Draw Buttons
function drawButtons(currentState){
  let pause_stop_button_number = 0;
  if(currentState == 1){
    pause_stop_button_number = 1;
  }  
  image(btn_pause[pause_stop_button_number], 81, 304, 38, 38);
  image(btn_record[currentState], 139, 298, 50, 50);
  image(btn_stop[pause_stop_button_number], 210, 304, 38, 38);
}
//==================== 3.Draw Status Bar
function drawStatusBar(currentState){
  fill(255, 51);
  noStroke();
  rect(2,2,104,20,4);
  rect(118,2,82,20,4);
  rect(212,2,106,20,4);
  
  textFont('Inter');
  textSize(14);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  if(currentState == 0){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 1){
    fill(202,38,38);
    noStroke();
    ellipse(16,12,12,12);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    fill(255);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 2){
    noFill();
    stroke(202,38,38);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    fill(255,153);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 3){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }
}
//==================== 4.Draw State Indicator
function drawStateIndicator(currentState){
  image(stateIndicator[currentState], 100,262,120,20);
}
//==================== 5.Draw Counter
function drawCounter(currentState){
  fill(255, 51);
  noStroke();
  rect(2,262,60,20,4);
  
  textFont('Inter');
  textSize(14);
  
  if(currentState == 1){
    fill(255);
    textAlign(LEFT);
    text(peopleNumber, 29, 277);
    image(icon_person, 7,264,16,16);
  }else{
    fill(255,153);
    textAlign(LEFT);
    text(peopleNumber, 29, 277);
    tint(255,153);
    image(icon_person, 7,264,16,16);
    tint(255);
  }
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}

function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 160, 319) <= 21){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 102, 319) <= 14){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 218, 319) <= 14){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 160, 319) <= 21){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(dist(mouseX, mouseY, 160, 319) <= 21){ // for Recording BTN
      state = 0; //go to 0.Main Page from 3.Saved Page.
    }
  }
}

function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    recordingTime = '00:00:00';
  }
}

function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}

function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람마다의 X, Y 좌표값 저장
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}

function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}