"use strict";

var server = require('http').createServer();
var io = require('socket.io')(server);
var _ = require('underscore');

// Here is your new Game!
var Card = require('./card');
var Player = require('./player');
var Game = require('./game');
var game = new Game();
var count = 0; // Number of active socket connections
var winner = null; // Username of winner

function getGameState() {
  var currentPlayerUsername;
  var players = "";
  var numCards = {};

  var isStarted = game.isStarted;
  var cardsInDeck = game.pile.length;
  var currentPlayerUsername = game.players[game.playerOrder[0]].username;
  var playersInGame = Object.values(game.players).map(player => player.username)
  // console.log(game.players, playersInGame)

  // see if we have a winner
  var win = undefined;
  // console.log(game.players)
  for(let playerId in game.players) {
    if(game.isWinning(playerId)) {
      win = game.players[playerId].username;
      break;
    }
  }
  
  //populate numcards
  for(let playerId in game.players) {
    numCards[playerId] = game.players[playerId].pile.length;
  }

  console.log(numCards)

  // YOUR CODE HERE


  // return an object with 6 different properties
  return {
    isStarted,
    numCards,
    currentPlayerUsername,
    playersInGame,
    cardsInDeck,
    win
  }
}

io.on('connection', function(socket) {

  if (game.isStarted) {
    // whenever a player joins an already started game, he or she becomes
    // an observer automatically
    socket.emit('observeOnly');
  }
  count++;
  socket.on('disconnect', function () {
    count--;
    if (count === 0) {
      game = new Game();
      winner = null;
    }
  });

  socket.on('username', function(data) {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Restart the server to start a new game.`);
      return;
    }
    try {
      console.log('user is', data);

      socket.playerId = game.addPlayer(data);
      io.emit('username', { id: socket.playerId, username: data });
      io.emit('updateGame', getGameState());
    }
    catch (error) {
      socket.emit('errorMessage', error)
    }
  });

  socket.on('start', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Restart the server to start a new game.`);
      return;
    }

    if (!socket.playerId) {
      socket.emit('errorMessage', 'You are not a player of the game!')
      console.log('error', error);
    }
    else {
      try {
        game.startGame();
        io.emit('start');
        io.emit('updateGame', getGameState());
        console.log('game has started', getGameState());
        
      }
      catch (error) {
        socket.emit('errorMessage', error)
        console.log('error', error);
        
      }
    }
  });

  socket.on('playCard', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Restart the server to start a new game.`);
      return;
    }

    // console.log('playerid',socket.playerId);
    if (!socket.playerId) {
      socket.emit('errorMessage', 'You are not a player of the game!')
    }
    else {
      try {
        var ret = game.playCard(socket.playerId);
        console.log('ret is', ret);
        io.emit('playCard', ret);
      }
      catch (error) {
        socket.emit('errorMessage', error)
      }
    }

    // YOUR CODE ENDS HERE
    // broadcast to everyone the game state
    io.emit('updateGame', getGameState());
  });

  socket.on('slap', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Restart the server to start a new game.`);
      return;
    }
    // TODO
  });

});

var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
