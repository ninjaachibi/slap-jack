if(!process.argv[2]) {
    console.error('Usage: Need a username')
    process.exit(1)
}

var socket = require('socket.io-client')('http://localhost:3000');

const repl = require('repl')
const chalk = require('chalk');

let user = {};

socket.on('disconnect', function () {
    socket.emit('disconnect')
});
socket.on('connect', () => {
    console.log(chalk.red('=== start chatting ==='));
    user.username = process.argv[2];

    socket.emit('username', process.argv[2])
})

socket.on('message', (data) => {
    console.log(chalk.magenta(data));
})

socket.on('username', (data) => {
    console.log(chalk.blue(`${data.username} joined the game`))
    user = data;
    // console.log('user is', user);
})
socket.on('updateGame', (gameState) => {

    // Displays the username and number of cards the player has
    if (user) {
        console.log(chalk.blue('Playing as ' + user.username));
        console.log(chalk.green((gameState.numCards[user.id] || 0) + ' cards in hand'));
    }

    // Displays the current player
    if (gameState.isStarted) {
        console.log(chalk.blue(gameState.currentPlayerUsername + "'s turn"));
    } else {
        console.log(chalk.blue('Game has not started yet.'));
    }

    // Displays the number of cards in the game pile
    console.log(chalk.white(gameState.cardsInDeck + ' cards in pile'));

    // If the game is in a winning state, hide everything and show winning message
    if (gameState.win) {
        console.log(chalk.red(gameState.win + ' has won the game!'));
    }

})
socket.on('playCard', function (data) {

    const cardString = data.cardString;
    console.log(chalk.white.bgCyan(cardString + ' played'));
});

socket.on('start', function () {
    console.log(chalk.blue('game has started'))
});
// socket.on('clearDeck', function () {
//     // CODE HERE
// });

// A handler for error messages
socket.on('errorMessage', function (data) {
    console.log(chalk.red(data)); //make this red chalk
})


// have different cmd signal different 'clicks'
repl.start({
    prompt: '',
    eval: (cmd) => {
        cmd = cmd.trim()

        if (cmd === 'start') { //start the game
            socket.emit('start');
        }

        else if (cmd === 'p') {
            socket.emit('playCard');
        }
        else if (cmd === 's') {
            socket.emit('slap');
        }
        else {
            // console.log('default case');
        }
    }
})

