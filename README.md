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

<iframe src='https://gfycat.com/ifr/HollowHastyLadybug' frameborder='0' scrolling='no' allowfullscreen width='640' height='689'></iframe>


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

<iframe src='https://gfycat.com/ifr/FamiliarElegantBarebirdbat' frameborder='0' scrolling='no' allowfullscreen width='640' height='687'></iframe>

### Running the testing framework

I used Jasmine as a testing framework for my unit tests, which test the `Player`, `Card`, and `Game` classes. 

To run the tests, in your terminal, run
```
npm test 
```

## Design Rationale 🎨

I used Modern Javascript ES6 functionality to build. 

That meant that I thought of abstracting the majority of the game of slapjack into the `Game` class using [ES6 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). In my design process, it made sense to abstract `Card` since it had `value` and `suit` information. Since I wanted a multiplayer game, it was reasonable to abstract `Player` into its own class.

### Game Logic and Backend Design ♠️
I used the [socket.io](socket.io) library as a the primary backbone of my backend server. Sockets are pretty similar to event emitters, so my backend is quite event emitter-based consisting of a network of event-listeners and event-emitters.

### Displaying the Game ♥️

A major difficulty for me was creating a front-end client for this game within the terminal. While it may have been more initutive to build a web app for the front-end, I used `socket.io-client` to send events to our socket backend. To display the messages reeived by our clients, I used the `chalk` library, which had a great choice of text colors and styles to choose from. To prompt the terminal, I used the `repl` library, although I may switch to `commander` after some more research. 

### Testing ♣  ️
I used the Jasmine testing framework to write my unit tests. I used jasmine since I'm familiar with it and it's a well documented JS testing framework, along with Jest. 

### External libraries used ♦
- I used [`underscore.js`](https://underscorejs.org/) for their fantastic `shuffle()` method using a version of the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle).

 - socket.io is a quick and high performant extension of event emitters. We are using this library to send and receive events between our clients and server with WebSockets. 

	I used sockets since they are performant and are pretty similar to most other event emitter frameworks. Further, the documentation for the library is really solid.



## Things to fix/Known bugs 🐛

This project is by no means perfect and is very much a work-in-progress. Below is a list of TODOs, as well as known bugs and issues. If any bugs or issues not listed below are found, filing a bug or issue report would be greatly appreciated!

TODO:
* implement persistence - I've written out the skeleton code for it, but I need to implement it
* write some end-to-end tests - although I've written unit tests for each of the `Card`, `Player`, and `Game` classes, there's still room for E2E and integration tests to check that everything is working together correctly
* implement observer status - if a game has already started, and a new user joins when a game is already in session, they can watch, but not participate.
* use better colors in chalk to be more consistent across message types
* deploy the app to Heroku to play with friends
* implement custom rooms for each game using socket rooms/namespaces

Known bugs and issues 🐛:
* Upon join the room, every user gets the error message `Error, not started yet`. It doesn't hurt anyone, but it's annoying and verbose.
* If `p` is pressed before the game is started, the server crashes
* In some certain cases, a player loses all their cards after slapping
* If a card is played out of turn, the game refreshes for everyone.
* When a player wins, the winning message may not be broadcast. Instead the error `Error, not started yet` appears. There should be a global message broadcast to the entire game room.
* When a player gets low on cards, usually from excessive slapping, they fail to lose 3 cards when they only have 3 or less left, and the game ends. However, the game should continue in this situation, as it should only stop when someone slaps.



