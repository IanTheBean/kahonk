//trivia API: https://opentdb.com/api.php?amount=1&category=9&type=multiple
const https = require('https');
express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require("path");
const QUESTION_TIME = 10000;
const LINK = 'https://opentdb.com/api.php?amount=1&category=9&type=multiple';
const QUESTIONSPERGAME = 10;
let rooms = {};
let questionNumber = 1;

function createRoom(creator, socket){
    var room = {};
    var code = createCode(6);
    room["users"] = {};
    room["users"][creator] = {score: 0, socket: socket};

    rooms[code] = room;
    console.log(rooms);
}

function joinRoom(name, code, socket){
    rooms[code]["users"][name] = {score: 0, socket: socket}
    console.log(rooms);
}

function createCode(len){
    let code = "";
    for(let i = 0; i < len;i++){
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

app.use(express.static('/Users/ianmorgan/Desktop/Kahonk/client'));

//open a port on the server to listen for new connections
http.listen(1234, () => {
	console.log('listening on Port 1234');
});

//send any new connection the client's script
app.get('/', (req, res) => {
	res.sendFile(path.join("/Users/ianmorgan/Desktop/Kahonk/client/join/join.html"));
});

//wait for new players
io.on('connection', (socket) => {
    console.log("new player has joined at socket " + socket.id);
    socket.on("join room", (room) => {
        console.log(room.name + " is joining room " + room.code);
        joinRoom(room.name, room.code, socket.id)
    });
    socket.on("create room", (name) => {
        console.log(name + " had created room");
        createRoom(name, socket.id);
    });
// 	socket.on('new player', (name) => {
// 	    console.log(name + " has connected");
//         var leaderBoardSpot = {
//             PlayerName : name,
//             PlayerScore : 0
//         };
// 	    leaderBoard.push(leaderBoardSpot);
//     });

//     //when we get an update to a client's score, we update their info in the leaderboard
//     socket.on('update score', (playerName, scoreToAdd) => {
//         var scoreIndex = findNameInLeaderBoard(playerName);
//         leaderBoard[scoreIndex].PlayerScore += scoreToAdd;
//     });
//     // we check the score of the player to make sure that the player's score and the server's score for that player line up
//     socket.on('check score', (playerName, scoreToCheck) =>{
//     	var scoreIndex = findNameInLeaderBoard(name);
//         if(leaderBoard[scoreIndex].PlayerScore == scoreToCheck){
//      		return;
//         }else{
//         	socket.broadcast.to(socket.id).emit('score incorrect', leaderBoard[scoreIndex].PlayerScore);
//         }
//     });
});

// //returns the leaderboard position of the player that has the given name
// function findNameInLeaderBoard(name){
//     for(var i = 0; i < leaderBoard.length; i++){
//         if(leaderBoard[i].PlayerName == name){
//             return i;
//         }
//     }
// }

// //grab a question from the trivia api service
// //this method of grabbing a json from an api is not mine and was taken from the first example in https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
// function getQuestionFromApi(){
// 	https.get(LINK, (resp) => {
// 	var data = '';

// 	resp.on('data', (chunk) => {
// 		data += chunk;
// 		});

// 		resp.on('end', () => {
//             var json = JSON.parse(data);
// 			handleJSON(json);
// 		});
// 	});
// }

// //take the json recived from the api and distribute it to the players
// function handleJSON(data){
//     //first we create a json with all of the information a player needs, then we send it
//     console.log(data);
// 	if(questionNumber <= QUESTIONSPERGAME){
//         var info = {
//              leaderboard : leaderBoard,
//              question : data,
//              number : questionNumber
//         };
// 		io.emit('new question', info);
// 		questionNumber++;

//     //if all the questions have been asked
// 	} else{
// 		io.emit('gameover', leaderBoard);
// 		clearInterval(interval);
// 	}
// }

// //create a loop for the game to operate on
// var interval = setInterval(getQuestionFromApi, QUESTION_TIME);
