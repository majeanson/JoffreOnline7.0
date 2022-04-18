const _ = require('lodash');
const server = require('express')();
const http = require('http').createServer(server);
const shuffle = require('shuffle-array');
const cors = require('cors');

let players = {};
let observators = {};
let currentDropZone = [];
let deadZone = [];

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://192.168.2.47:8080', 
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

const getPlayerHand = (socketId) => {
    return players[socketId].inHand;
}

const getPlayerIndex = (socketId) => {
    let foundIndex = 0;
    Object.keys(players).forEach((aSocketId, idx) => {
        if (aSocketId == socketId) {
            foundIndex = idx;
        }
    });
    return foundIndex;
}

const cardPlayed = (socketId, cardName) => {
    if (canPlayCard(socketId, cardName)) {
        players[socketId].inHand = players[socketId]?.inHand?.filter(aCardName => aCardName !== cardName);
        players[socketId].isMyTurn = false;
        const playerIndex = getPlayerIndex(socketId);
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        players[Object.keys(players)[nextPlayerIndex]]['isMyTurn'] = true;
        
        currentDropZone.push(cardName);
        return true;
    }
    return false;
}

const cardMovedInHand = (socketId, card, index) => {

    function arraymove(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        console.log(arr);
    }
    

    if (index > -1) {
        const movingCardIdx = getPlayerCardIdx(socketId, card);
        if (movingCardIdx > -1) {
            arraymove(getPlayerHand(socketId), movingCardIdx, index)
        }
    }
    console.log(getPlayerHand(socketId));
    return false;
}

const getPlayerCardIdx = (socketId, card) => {
    return getPlayerHand(socketId)?.findIndex(aCard => aCard === card);
}

const canPlayCard = (socketId, cardName) => {
    console.log('CAN PLAY CARD? ');
    const respectsColorPlayed = getRespectsColorPlayed(cardName);
    const hasRequestedColorInHand = getHasRequestedColorInHand(socketId, cardName);
    return respectsColorPlayed || !hasRequestedColorInHand;
}

const getRespectsColorPlayed = (cardName) => {
    if (currentDropZone.length === 0) {
        return true;
    } else {
        const card = currentDropZone[0];
        const cardColor = card.split('_')[0];
        const refCardColor = cardName.split('_')[0];
        return cardColor === refCardColor;
    };
}


const getHasRequestedColorInHand = (socketId, cardName) => {
    if (currentDropZone.length === 0) {
        return true;
    } else {
        const playerHand = getPlayerHand(socketId);
        const requestedCardColor = currentDropZone[0]?.split('_')[0];
        let count = 0;
        playerHand?.forEach(card => {
            const cardColor = card.split('_')[0];
            if (cardColor === requestedCardColor) {
                count = count = 1;
            }
        });
        return count >= 1;
    }

    const playerHand = getPlayerHand(socketId);
    return playerHand?.some(card => {
        const cardColor = card.split('_')[0];
        const refCardColor = cardName.split('_')[0];
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
}
const endTheTrick = () => {
    const winningPlayerIndex = findTheWinningCardAndAddPoints()
    deadZone.push(...currentDropZone);
    currentDropZone = [];
    players[Object.keys(players)[0]]['isMyTurn'] = false;
    players[Object.keys(players)[1]]['isMyTurn'] = false;
    players[Object.keys(players)[2]]['isMyTurn'] = false;
    players[Object.keys(players)[3]]['isMyTurn'] = false;
    players[Object.keys(players)[winningPlayerIndex]]['isMyTurn'] = true;


    io.emit('endTheTrick', currentDropZone, players, deadZone, winningPlayerIndex);
}

const findTheWinningCardAndAddPoints = () => {
    let winningPlayerIndex = 0;
    const requestedTrickColor = currentDropZone[0].split('_')[0];
    let highestTrickValue = currentDropZone[0].split('_')[1];
    currentDropZone?.forEach((card, idx) => {        
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        if (cardColor === requestedTrickColor && cardValue > highestTrickValue) {
            highestTrickValue = cardValue;
            winningPlayerIndex = idx;
            console.log('highestTrickValue ', highestTrickValue, 'winningPlayerIndex ', )
        }
    });
    let pointsToAdd = 1;
    if (hasBonhommeBrun()) {
        pointsToAdd = pointsToAdd - 3;
    }
    if (hasBonhommeRouge()) {
        pointsToAdd = pointsToAdd + 5;
    }
    players[Object.keys(players)[winningPlayerIndex]].trickPoints += pointsToAdd;
    return winningPlayerIndex;    
}

const hasBonhommeBrun = () => {
    return currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'al' && cardValue === '0');
    });
}

const hasBonhommeRouge = () => {
    return currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'fr' && cardValue === '0')
    });
}

io.on('connection', function (socket) {
    console.log('connected with socket id ' + socket.id);
    socket.on('disconnect', function () {
        console.log('disconnected from socket id ', socket.id);
        players = _.mapKeys(players, function (value, key) {
            console.log(socket.id, key);
            if (key === socket.id) {
                return 'empty';
            } else {
                return key;
            }
        });
        delete observators[socket.id];
        console.log(players);
    })
    if (players['empty']) {
        players = _.mapKeys(players, function (value, key) {
            if (key === 'empty') {
                return socket.id;
            } else {
                return key;
            }
        });
        console.log(players);
        io.emit('refreshCards', players, currentDropZone, deadZone);
        return;
    }
    if (Object.keys(players).length < 4) {
        players[socket.id] = {
            inHand: [],
            isDeckHolder: false,
            isMyTurn: false,
            trickPoints: 0,
        }
        if (Object.keys(players).length === 1) {
            players[socket.id]['isDeckHolder'] = true;
            players[socket.id]['isMyTurn'] = true;
        }

        if (Object.keys(players).length === 4) {
            io.emit('changeGameState', 'gameReady', 'La partie peut d\u00E9buter');
            const hasOneDeckHolder = Object.values(players).some(player => {
                player.isDeckHolder === true;
            });
            if (!hasOneDeckHolder) {
                players[Object.keys(players)[0]]['isDeckHolder'] = true;
                players[Object.keys(players)[0]]['isMyTurn'] = true;
            }
        } else {
            io.emit('changeGameState', 'lobby', 'Le lobby doit se remplir');
        }

    } else {
        observators[socket.id] = {
        }
    }

    console.log('Current socket id : ', socket.id, 'Players : ', players, 'Observators : ', observators, 'Current drope zone : ', currentDropZone);

    socket.on('dealCards', function (socketId) {
        dealCards();
        io.emit('refreshCards', players, currentDropZone, deadZone);
    })

    socket.on('cardPlayed', function (socketId, cardName) {
        let result = cardPlayed(socketId, cardName);
        if (result) {
            let index = currentDropZone.length;
            
            io.emit('cardPlayed', socketId, cardName, index, result, currentDropZone, players, deadZone);
            const dropZoneIsFull = currentDropZone.length === 4;
            if (dropZoneIsFull) {
                endTheTrick();
            }
        }
    })

    socket.on('cardMovedInHand', function (socketId, card, index) {
        cardMovedInHand(socketId, card, index);
        io.emit('cardMovedInHand', socketId, players, currentDropZone, deadZone);
    })
    
    
})

http.listen(3000, function (socketId) {
    console.log('hey ', socketId);
});