//trivia API: https://opentdb.com/api.php?amount=1&category=9&type=multiple
const https = require('https');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const QUESTION_TIME = 10000;
const LINK = 'https://opentdb.com/api.php?amount=1&category=9&type=multiple';
const QUESTIONSPERGAME = 10;
var leaderBoard = [];
var questionNumber = 1;

//open a port on the server to listen for new connections
http.listen(3000, () => {
	console.log('listening on Port 3000');
});

//send any new connection the client's script
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

//whenever we get a new player, take their name and create a spot on the leaderboard to store their information
io.on('connection', (socket) => {
	socket.on('new player', (name) => {
	    console.log(name + " has connected");
        var leaderBoardSpot = {
            PlayerName : name,
            PlayerScore : 0
        };
	    leaderBoard.push(leaderBoardSpot);
    });
    //when we get an update to a client's score, we update their info in the leaderboard
    socket.on('update score', (playerName, scoreToAdd) => {
        var scoreIndex = findNameInLeaderBoard(playerName);
        leaderBoard[scoreIndex].PlayerScore += scoreToAdd;
    });
    // we check the score of the player to make sure that the player's score and the server's score for that player line up
    socket.on('check score', (playerName, scoreToCheck) =>{
    	var scoreIndex = findNameInLeaderBoard(name);
        if(leaderBoard[scoreIndex].PlayerScore == scoreToCheck){
     		return;
        }else{
        	socket.broadcast.to(socket.id).emit('score incorrect', leaderBoard[scoreIndex].PlayerScore);
        }
    });
});

//returns the leaderboard position of the player that has the given name
function findNameInLeaderBoard(name){
    for(var i = 0; i < leaderBoard.length; i++){
        if(leaderBoard[i].PlayerName == name){
            return i;
        }
    }
}

//grab a question from the trivia api service
//this method of grabbing a json from an api is not mine and was taken from the first example in https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
function getQuestionFromApi(){
	https.get(LINK, (resp) => {
	var data = '';

	resp.on('data', (chunk) => {
		data += chunk;
		});

		resp.on('end', () => {
            var json = JSON.parse(data);
			handleJSON(json);
		});
	});
}

//take the json recived from the api and distribute it to the players
function handleJSON(data){
    //first we create a json with all of the information a player needs, then we send it
    console.log(data);
	if(questionNumber <= QUESTIONSPERGAME){
        var info = {
             leaderboard : leaderBoard,
             question : data,
             number : questionNumber
        };
		io.emit('new question', info);
		questionNumber++;

    //if all the questions have been asked
	} else{
		io.emit('gameover', leaderBoard);
		clearInterval(interval);
	}
}

//create a loop for the game to operate on
var interval = setInterval(getQuestionFromApi, QUESTION_TIME);
