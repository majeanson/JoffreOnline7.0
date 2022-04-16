const server = require('express')();
const http = require('http').createServer(server);
const shuffle = require('shuffle-array');
const cors = require('cors');

let players = {};
let observators = {};
let currentDropZone = [];

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:8080', 
        methods: ["GET", "POST"]
    }
});

const allCards =
[
    'al_0',
    'al_1',
    'al_2',
    'al_3',
    'al_4',
    'al_5',
    'al_6',
    'al_7',
    'an_0',
    'an_1',
    'an_2',
    'an_3',
    'an_4',
    'an_5',
    'an_6',
    'an_7',
    'fr_0',
    'fr_1',
    'fr_2',
    'fr_3',
    'fr_4',
    'fr_5',
    'fr_6',
    'fr_7',
    'ru_0',
    'ru_1',
    'ru_2',
    'ru_3',
    'ru_4',
    'ru_5',
    'ru_6',
    'ru_7'
];

const getShuffledCards = () => {
    const clone = allCards.slice();
    clone.sort(() => 0.5 - Math.random());
    return clone;
}

const cardPlayed = (socketId, cardName) => {
    if (canPlayCard(socketId, cardName)) {
        players[socketId].inHand = players[socketId]?.inHand?.filter(card => card !== cardName);
        currentDropZone.push(cardName);
        console.log(cardName, players[socketId], currentDropZone);
        return true;
    }
    return false;
}

const getPlayerHand = (socketId) => {
    return players[socketId].inHand;
}

const canPlayCard = (socketId, cardName) => {
    const respectsColorPlayed = getRespectsColorPlayed(cardName);
    const hasRequestedColorInHand = getHasRequestedColorInHand(socketId, cardName);
    console.log('respectsColorPlayed', respectsColorPlayed, 'hasRequestedColorInHand', hasRequestedColorInHand);
    return respectsColorPlayed || !hasRequestedColorInHand;
}

const getRespectsColorPlayed = (cardName) => {
    console.log(currentDropZone);
    if (currentDropZone.length === 0) {
        return true;
    } else {
        return currentDropZone?.some(card => {
            const cardColor = card.split('_')[0];
            const refCardColor = cardName.split('_')[0];
            
            return cardColor === refCardColor;
        });
    }
}

const getHasRequestedColorInHand = (socketId, cardName) => {
    if (currentDropZone.length === 0) {
        return true;
    } else {
        const playerHand = getPlayerHand(socketId);
        const requestedCardColor = currentDropZone[0]?.split('_')[0];
        console.log('aaaa', requestedCardColor, playerHand, currentDropZone);
        let count = 0;
        playerHand?.forEach(card => {
            const cardColor = card.split('_')[0];
            if (cardColor === requestedCardColor) {
                count = count = 1;
            }
        });
        console.log(count);
        return count >= 1;
    }

    const playerHand = getPlayerHand(socketId);
    return playerHand?.some(card => {
        const cardColor = card.split('_')[0];
        const refCardColor = cardName.split('_')[0];
        console.log(cardColor, refCardColor);
        return cardColor === refCardColor;
    })
}

const dealCards = (socketId) => {
    const shuffledCards = getShuffledCards();
    currentDropZone = [];
    Object.values(players).forEach(player => {
        player.inHand = [];
        player.inHand = shuffledCards.splice(0, 8);
    });
    console.log(players);
}

io.on('connection', function (socket) {
    if (Object.keys(players).length < 4) {
        players[socket.id] = {
            inHand: [],
            isDeckHolder: false
        }
        if (Object.keys(players).length === 1) {
            players[socket.id]['isDeckHolder'] = true;
        }

        if (Object.keys(players).length === 4) {
            io.emit('changeGameState', 'gameReady');
            console.log(players);
        } else {
            io.emit('changeGameState', 'lobby');
        }

    } else {
        observators[socket.id] = {
        }
    }

    console.log('Players : ', players, 'Observators : ', observators, 'Current drope zone : ', currentDropZone);

    socket.on('dealCards', function (socketId) {
        console.log('server deal cards')
        dealCards();
        io.emit('dealCards', socketId, players);
    })

    socket.on('cardPlayed', function (socketId, cardName) {
        console.log('server card played')
        let result = cardPlayed(socketId, cardName);
        let index = 0;
        io.emit('cardPlayed', socketId, cardName, index, result);
    })


    socket.once('disconnect', function () {
        delete players[socket.id];
        delete observators[socket.id];
    })
    
})

http.listen(3000, function () {
    console.log('lezgo');
});