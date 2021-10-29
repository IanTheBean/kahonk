//trivia API: https://opentdb.com/api.php?amount=1&category=9&type=multiple
const https = require("https");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const io = require("socket.io")(http);
const QUESTION_TIME = 10000;
var leaderBoard = [];
var questionNumber = 0;

let rawQuestionData = fs.readFileSync("questions.json");
const questions = JSON.parse(rawQuestionData);

//open a port on the server to listen for new connections
http.listen(process.env.PORT || 5000, () => {
  console.log("listening on Port " + process.env.PORT || 5000);
});

app.use(express.static(__dirname + "/public"));

//send any new connection the client's script
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/join/join.html");
});

//whenever we get a new player, take their name and create a spot on the leaderboard to store their information
io.on("connection", (socket) => {
  socket.on("new player", (name) => {
    console.log(name + " has connected");
    var leaderBoardSpot = {
      PlayerName: name,
      PlayerScore: 0,
    };
    leaderBoard.push(leaderBoardSpot);
  });
  //when we get an update to a client's score, we update their info in the leaderboard
  socket.on("update score", (playerName, scoreToAdd) => {
    var scoreIndex = findNameInLeaderBoard(playerName);
    leaderBoard[scoreIndex].PlayerScore += scoreToAdd;
  });
});

//returns the leaderboard position of the player that has the given name
function findNameInLeaderBoard(name) {
  for (var i = 0; i < leaderBoard.length; i++) {
    if (leaderBoard[i].PlayerName == name) {
      return i;
    }
  }
}

function updateLeaderBoard() {
  for (let i = 0; i < leaderBoard.length; i++) {
    let max = 0;
    let maxIndex = i;
    for (let j = i; j < leaderBoard.length; j++) {
      if (leaderBoard[j].PlayerScore >= max) {
        max = leaderBoard[j].PlayerScore;
        maxIndex = j;
      }
    }
    let temp = leaderBoard[i];
    leaderBoard[i] = leaderBoard[maxIndex];
    leaderBoard[maxIndex] = temp;
  }
}

//take the json recived from the api and distribute it to the players
function newQuestion() {
  updateLeaderBoard();

  //first we create a json with all of the information a player needs, then we send it
  var info = {
    leaderboard: leaderBoard,
    question: questions[questionNumber],
  };
  console.log("sending question: " + questions[questionNumber].question);
  io.emit("new question", info);
  if (questionNumber == questions.length - 1) {
    questionNumber = 0;
  } else {
    questionNumber++;
  }
}

//create a loop for the game to operate on
var interval = setInterval(newQuestion, QUESTION_TIME);
