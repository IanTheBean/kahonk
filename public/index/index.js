var socket = io();
var streakText = document.getElementById("streak");
var placeText = document.getElementById("place");
var pointsText = document.getElementById("points");
var nameText = document.getElementById("name");
var questionText = document.getElementById("question");
var questionNumberText = document.getElementById("number");
var timeSlider = document.getElementById("time_slider");
var body = document.getElementById("body");
var answerButtons = [];
var correctAnswerIndex = 0;
var points = 0;
var streak = 0;
var playerName = "";
var time = 1000;

const urlParams = new URLSearchParams(window.location.search);
playerName = urlParams.get("name");

for (var i = 0; i < 4; i++) {
  answerButtons.push(document.getElementById("answer" + i));
  console.log("answer button" + i + "was added");
  answerButtons[i].style.opacity = 0;
  answerButtons[i].disabled = true;
}

//set up the player and let the server know the name of the player
socket.emit("new player", playerName);
pointsText.innerText = points;
nameText.innerText = playerName;
socket.on("new question", (data) => {
  console.log("new question recieved");
  var json = data.question;
  var leaderboard = data.leaderboard;
  for (var i = 0; i < 4; i++) {
    answerButtons[i].style.opacity = 100;
    answerButtons[i].disabled = false;
  }
  questionNumberText.innerText = number + "/10";
  console.log(data);
  DisplayQuestion(json);
  UpdateLeaderBoard(leaderboard);
  time = 1000;
});

//time = 1000;

setInterval(function () {
  time -= 10;
  timeSlider.style.width = time / 10 + "%";
}, 100);

function DisplayQuestion(json) {
  var question = json.question;

  questionText.innerHTML = question;
  var wrongAnswers = json.incorrect_answers;
  var correctAnswer = json.correct_answer;
  correctAnswerIndex = Math.floor(Math.random() * 4);

  for (var i = 0; i < 4; i++) {
    if (i < correctAnswerIndex) {
      answerButtons[i].innerHTML = wrongAnswers[i];
    }

    if (i == correctAnswerIndex) {
      answerButtons[i].innerHTML = correctAnswer;
    }

    if (i > correctAnswerIndex) {
      answerButtons[i].innerHTML = wrongAnswers[i - 1];
    }
  }
}

function Points(time, streak) {
  return Math.round(time * (1 + 0.2 * streak));
}

function ButtonClicked(buttonNum) {
  for (var i = 0; i < 4; i++) {
    if (i != correctAnswerIndex) {
      answerButtons[i].disabled = true;
      answerButtons[i].style.opacity = 0;
    } else {
      answerButtons[i].disabled = true;
    }
  }
  if (buttonNum == correctAnswerIndex) {
    var pointsToChange = Points(time, streak);
    points += pointsToChange;
    socket.emit("update score", playerName, pointsToChange);
    streak++;
    streakText.style.color = "#fdb731";
  } else {
    streakText.style.color = "#000000";
    streak = 0;
  }
  streakText.innerText = streak;
  nameText.innerText = playerName;
  pointsText.innerText = points;
}

socket.on("gameover", (json) => {
  GameOver(json);
});

function UpdateLeaderBoard(leaderBoard) {
  var currentPlace = 1;
  for (var i = 0; i < leaderBoard.length; i++) {
    if (leaderBoard[i].PlayerName != playerName) {
      if (leaderBoard[i].PlayerScore > points) {
        currentPlace++;
      }
    }
  }

  var whatToDisplay = "";
  if (currentPlace == 1) {
    whatToDisplay += "1st";
  } else if (currentPlace == 2) {
    whatToDisplay += "2nd";
  } else if (currentPlace == 3) {
    whatToDisplay += "3rd";
  } else {
    whatToDisplay += currentPlace + "th";
  }
  placeText.innerText = whatToDisplay;
}

function GameOver(leaderBoard) {
  console.log(leaderBoard);
  var maxScore = 0;
  var bestName = "";
  for (var i = 0; i < leaderBoard.length; i++) {
    if (leaderBoard[i].PlayerScore >= maxScore) {
      maxScore = leaderBoard[i].PlayerScore;
      bestName = leaderBoard[i].PlayerName;
    }
  }
  body.innerHTML =
    '<h1 id="final_text">' +
    bestName +
    " won with a grand total of " +
    maxScore +
    " points!" +
    "</h1>";
}
