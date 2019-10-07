var _ = require('underscore');
var persist = require('./persist');
var Card = require('./card');
var Player = require('./player');
var readGame = false;

class Game {
  constructor() {
    this.isStarted = false;
    this.players = {}; // store the Player objects by the key of an ID and value of a Player object.
    this.playerOrder = []; //An Array of IDs of players, representing their order in the game. The current player will always be at index 0.
    this.pile = []; //An Array of Card objects representing the central pile.  
  }

  addPlayer(username) {
    if (this.isStarted) throw "Error, already started the game";
    if (!username.trim()) throw "Error, empty username";
    //check for non-unique username
    for (var playerId of this.playerOrder) {
      if (this.players[playerId].username === username) throw "Error, non-unique username";
    }

    var newPlayer = new Player(username);

    this.playerOrder.push(newPlayer.id);
    this.players[newPlayer.id] = newPlayer;

    return newPlayer.id;
  }

  startGame() {
    if (this.isStarted) throw "Error, already started game"
    if (Object.keys(this.players).length < 2) throw "Error, fewer than two players"

    this.isStarted = true;

    //create standard deck
    var suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    var tempDeck = [];
    for (var suit of suits) {
      for (var value = 1; value < 14; value++) {
        tempDeck.push(new Card(suit, value));
      }
    }
    var shuffledDeck = _.shuffle(tempDeck);

    for (var i = 0; i < shuffledDeck.length; i++) {
      var currentPlayerId = this.playerOrder[i % this.playerOrder.length];
      this.players[currentPlayerId].pile.push(shuffledDeck[i]);
    }

  }

  nextPlayer() {
    if (!this.isStarted) throw "Error, not started yet";

    do {
      var temp = this.playerOrder.shift();
      this.playerOrder.push(temp);
    } while (this.players[this.playerOrder[0]].pile.length === 0)
  }

  isWinning(playerId) {
    if (!this.isStarted) throw "Error, not started yet";

    if (this.players[playerId].pile.length === 52) {
      this.isStarted = false;
      return true;
    }
    else {
      return false;
    }
  }

  playCard(playerId) {
    if (!this.isStarted) throw "Error, not started yet";
    if (this.playerOrder[0] !== playerId) throw "Don't play out of turn!";
    if (this.players[playerId].pile.length === 0) throw "you have no cards left";

    //move top card of player's pile to top of deck
    var currentCard = this.players[playerId].pile.pop();
    this.pile.push(currentCard);

    //count the number of players with 0 cards
    var countZero = 0;
    for (var playerId in this.players) {
      if (this.players[playerId].pile.length === 0) {
        countZero++;
      }
    }
    if (countZero === this.playerOrder.length) {
      this.isStarted = false;
      throw "Error, it's a tie"
    }

    //move to next player
    this.nextPlayer();

    return {
      card: currentCard,
      cardString: currentCard.toString()
    }
  }

  slap(playerId) {
    if (!this.isStarted) throw "Error, not started yet";
    if (this.pile.length < 2 ) throw "Cannot slap a pile of size 1 or 0"

    if (this.pile[this.pile.length - 1].value === 11 ||
      this.pile.length > 2 &&
      (this.pile[this.pile.length - 1].value === this.pile[this.pile.length - 2].value || this.pile[this.pile.length - 1].value === this.pile[this.pile.length - 3].value)
    ) {
      this.players[playerId].pile = [...this.pile, ...this.players[playerId].pile];
      this.pile = [];

      return {
        winning: this.isWinning(playerId),
        message: 'got the pile!'
      }
    }
    else {
      //take cards from the players pile and add it to the bottom of the game pile
      for (var i = 0; i < Math.min(3, this.players[playerId].pile.length); i++) {
        var currentCard = this.players[playerId].pile.pop();
        this.pile.unshift(currentCard);
      }
      return {
        winning: false,
        message: `lost ${Math.min(3, this.players[playerId].pile.length)} cards!`
      }
    }
  }

  // PERSISTENCE FUNCTIONS
  // =====================
  fromObject(object) {
    this.isStarted = object.isStarted;

    this.players = _.mapObject(object.players, player => {
      var p = new Player();
      p.fromObject(player);
      return p;
    });

    this.playerOrder = object.playerOrder;

    this.pile = object.pile.map(card => {
      var c = new Card();
      c.fromObject(card);
      return c;
    });
  }

  toObject() {
    return {
      isStarted: this.isStarted,
      players: _.mapObject(this.players, val => val.toObject()),
      playerOrder: this.playerOrder,
      pile: this.pile.map(card => card.toObject())
    };
  }

  fromJSON(jsonString) {
    this.fromObject(JSON.parse(jsonString));
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }

  persist() {
    if (readGame && persist.hasExisting()) {
      this.fromJSON(persist.read());
      readGame = true;
    } else {
      persist.write(this.toJSON());
    }
  }
}

module.exports = Game;
