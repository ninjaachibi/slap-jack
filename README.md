# Slapjack 🃏
Here's a fun project - implementing the multiplayer card game _Slapjack_ using WebSockets with a terminal-based client!

## Table of Contents

* **Rules of Slapjack** 🃏
* **Getting Started** 🔥
* **Design Rationale 🎨** 
* **Things to fix/Know bugs 🐛** 

## Rules of Slapjack 🃏

In Slapjack, the objective of the game is to win the entire deck of cards (52 cards).

At the beginning of a game of Slapjack, each player is dealt an equal number of cards facedown (players are not able to see their own cards or anyone else's cards).

> If the number of players does not divide 52, then a few players might get additional cards. For example, players in a 3-player game will have 17, 17, and 18 cards.

Players will then go in order, playing the top card in their deck to the top of the pile until somebody reaches 52 cards (_the winning condition of the game_).

At any time, players can gain cards by "slapping" the pile - in which case they either gain the pile or lose 3 cards based on the following conditions:

* If the top card of the pile is a Jack, the player gains the pile
* If the top two cards of the pile are of the same value (i.e., two Aces, two 10's, two 2's), the player gains the pile
* If the top card and third-to-top card are of the same value (sandwich - i.e. (Ace-10-Ace), (7-Queen-7)), the player gains the pile
* Otherwise, the player loses 3 cards on top of his or her pile to the **bottom** of the central pile

Players can slap the pile even when it is not their turn.

If multiple players slap the pile in close succession, all players except the first one lose 3 cards. The first player to slap will win or lose cards based on the conditions listed above.


## Getting Started 🔥

As usual we first clone this repo, `cd` into it, and run `npm i`.

### Running the game

This will require one terminal window for the server, and then a terminal window for each of the players. 

> _Note_: since the server is `localhost` on this project, it only works locally. If you want, you could use a [`ngrok`](https://ngrok.com/) server to make this game playable across different networks.

1. In one terminal window, run `npm run server`.
2. In another window(s), run `npm run client <username>`. You should do this for each player you want to play in the game. Further, usernames must be unique. Since we're using sockets here, the room can accommodate a comfy **four** players. 

Here's what that looks like.

![](/public/output.gif)

#### Game Commands 🕹

Game commands are executed in the command prompt. Commands are executed by typing a valid command into the prompt followed by a newline (*Enter* on a PC or *return* on a Mac)

The commands are:

| command  |  effect  |  
|---|---|
| 'start'  |  signals the start of art a new game. A game must have at least two participants  | 
|  'p' |  plays the top card from your deck onto the pile. If you play out of turn, a an error message is output into your terminal. |
|  's'  |  signals a `slap` event. A player can slap at any time, and the effects of a given slap are documented above in the game rules above. |  

Anything else entered in the prompt is ignored.

Here's another demo in which we actually slap:

![](/public/output-2.gif)

### Running the testing framework

I used Jasmine as a testing framework for my unit tests, which test the `Player`, `Card`, and `Game` classes. 

To run the tests, in your terminal, run
```
npm test 
```

## Design Rationale 🎨

I used Modern Javascript ES6 functionality to build this game. 

That meant that I thought of abstracting the majority of the game of slapjack into the `Game` class using [ES6 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). In my design process, it made sense to abstract `Card` since it had `value` and `suit` information. Since I wanted a multiplayer game, it was reasonable to abstract `Player` into its own class.

### Cards 🂥 - `card.js`

For any given `Card` object, we have:

* The `value` of the playing card, from 1-13 (where Ace is 1, Jack is 11, Queen is 12, King is 13).
* The `suit` of the playing card, which any one of the following: _hearts_, _spades_, _clubs_, or _diamonds_.
* A `toString` function that allows us to get the human-readable description for the card, i.e. _Ace of Spades_, _8 of Hearts_, etc.

### Player 🐥 - `player.js`

For any given, `Player` object, we should have:

* `username`.
* `id` - generated upon construction.
* `pile` - represented by an Array of `Card` objects.
* A `generateId` function that helps to generate random strings. This uses the `crypto` library to generate a random hexadecimal id.

### Game 🏅 - `game.js`
This is the meat of the app! 🍖

Below is a brief explanation of each property for the `Game` object and how they are used:

* `isStarted` - A Boolean to check if the game is in progress or not. Initially, this will be `false`.
* `players` - An Object to store the `Player` objects by the key of an ID and value of a `Player` object. We should be able to access `Player`s from this object with `players[id]`.
* `playerOrder` - An Array of IDs of players, representing their order in the game. The current player will always be at index 0.

	```
	Initially, this.playerOrder is [0, 1, 2, 3]
	// After player 0 has played, the array becomes
	// [1, 2, 3, 0]
	// After player 1 has played, the array becomes
	// [2, 3, 0, 1]
	// After player 2 has played, the array becomes
	// [3, 0, 1, 2]
	// After player 3 has played, the array becomes
	// [0, 1, 2, 3]
	// and the cycle goes on...
	```

* `pile` - An Array of `Card` objects representing the central pile.

There are also a couple game-related functions:

* `addPlayer(username)` - for adding players into the game
	* takes a `username` as a String
	* returns the ID of the new `Player`

* `startGame()` - begins game setup

* `nextPlayer()` - moves the current player to the next player. i.e. rotate `this.playerOrder` array by one to the left until the player at index 0 has a non-zero pile of cards.

* `isWinning(playerId)` - takes a Player ID and return a boolean to determine whether or not the Player corresponding to that ID has won

* `playCard(playerId)` - takes a Player ID of the Player attempting to play a Card
	* Throws an error if the current Player ID does not match the passed-in Player ID (this means a player is attempting to play a card out of turn)
	* Throws an error if the Player corresponding to the passed-in Player ID has a pile length of zero
	* If no error was thrown:
		* **move** the *top* card of a Player's pile onto the *top* card of the Game pile.
		* **count** the number of players with 0 cards
			* If the number of players with 0 cards equals to the total number of players (i.e. everyone has no more cards), **set** `isStarted` to false and **throw** an error. (It's a tie!)
		* **calls** `this.nextPlayer()` to move the current player		
		* **returns** an object with two keys `card` and `cardString`.

* `slap(playerId)` - takes a Player ID of the Player attempting to slap and return an Object (format described below)
	* Check for any of the winning slap conditions
		* If the top card of the pile is a **Jack**
		* If the top two cards of the pile are of the same **value**
		* If the top card and third-to-top card are of the same value (a sandwich 🥪)

	* If there is a winning slap condition, **move** the pile into the **back of the pile** of the Player corresponding to the passed-in Player ID, and **set** `this.pile` to `[]`
		* Returns an object with the following key-value pairs:
			* `winning: this.isWinning(playerId)`
			* `message: 'got the pile!'`
	* Otherwise, takes the **top** 3 cards (at most) from the pile of the Player corresponding to the passed-in Player ID and add it to the **bottom** of the game pile
		* If the player has less than 3 cards, take everything. (Hint: `Math.min(3, len)`)
		* Returns an object with the following key-value pairs:
			* `winning: false`
			* `message: 'lost 3 cards!'`


### Game Logic and Backend Design ♠️
I used the [socket.io](socket.io) library as a the primary backbone of my backend server. Sockets are pretty similar to event emitters, so my backend is quite event emitter-based consisting of a network of event-listeners and event-emitters.

### Displaying the Game ♥️

A major difficulty for me was creating a front-end client for this game within the terminal. While it may have been more initutive to build a web app for the front-end, I used `socket.io-client` to send events to our socket backend. To display the messages reeived by our clients, I used the `chalk` library, which had a great choice of text colors and styles to choose from. To prompt the terminal, I used the `repl` library, although I may switch to `commander` after some more research. 

### Testing ♣  ️
I used the [Jasmine](https://jasmine.github.io/) testing framework to write my unit tests. I used jasmine since I'm familiar with it and it's a well documented JS testing framework, along with [Jest](https://jestjs.io/). 

The tests I've written so far are in `./tests.js`

### External libraries used ♦
- I used [`underscore.js`](https://underscorejs.org/) for their fantastic `shuffle()` method using a version of the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle).

 - socket.io is a quick and high performant extension of event emitters. We are using this library to send and receive events between our clients and server with WebSockets. 

	I used sockets since they are performant and are pretty similar to most other event emitter frameworks. Further, the documentation for the library is really solid.



## Things to fix/Known bugs 🐛

This project is by no means perfect and is very much a work-in-progress. Below is a list of TODOs, as well as known bugs and issues. If any bugs or issues not listed below are found, filing a bug or issue report would be greatly appreciated!

TODO 🗒:
* implement the control structure for the case of the top of the deck being a Jack.
* implement persistence - I've written out the skeleton code for it, but I need to implement it
* write some end-to-end tests - although I've written unit tests for each of the `Card`, `Player`, and `Game` classes, there's still room for E2E and integration tests to check that everything is working together correctly
* implement observer status - if a game has already started, and a new user joins when a game is already in session, they can watch, but not participate.
* use better colors in chalk to be more consistent across message types
* deploy the app to Heroku to play with friends
* implement custom rooms for each game using socket rooms/namespaces
* write better documentation for the errors that get can thrown.

Known bugs and issues 🐛:
* Upon join the room, every user gets the error message `Error, not started yet`. It doesn't hurt anyone, but it's annoying and verbose.
* If `p` is pressed before the game is started, the server crashes
* In some certain cases, a player loses all their cards after slapping
* If a card is played out of turn, the game refreshes for everyone.
* When a player wins, the winning message may not be broadcast. Instead the error `Error, not started yet` appears. There should be a global message broadcast to the entire game room.
* When a player gets low on cards, usually from excessive slapping, they fail to lose 3 cards when they only have 3 or less left, and the game ends. However, the game should continue in this situation, as it should only stop when someone slaps.



