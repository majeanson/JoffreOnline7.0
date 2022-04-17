import io from 'socket.io-client';

export default class SocketHandler {
    constructor(scene) {

        scene.socket = io('http://localhost:3000');

        scene.socket.on('dealCards', (socketId, players, currentDropZone) => {
            scene.GameHandler.dealCards(socketId, players, currentDropZone);
            scene.GameHandler.changeGameState('gameReady', "C'est au joueur " + (scene.GameHandler.getCurrentTurnIdx() + 1) + ' de jouer')
        })

        scene.socket.on('changeTurn', () => {
            scene.GameHandler.changeTurn();
        })

        scene.socket.on('changeGameState', (gameState, message = '') => {
            scene.GameHandler.changeGameState(gameState, message);
            if (gameState === 'gameReady') {
                scene.backCard.setInteractive();
                scene.backCard.setTint('0xffffff');
            } else {
                scene.backCard.disableInteractive(); //to readd
                scene.backCard.setTint(0x808080, 0xC0C0C0, 0xC0C0C0, 0x808080);
            }
        })

        scene.socket.on('cardPlayed', (socketId, cardName, index, result, currentDropZone, players) => {
            scene.DeckHandler.cardPlayed(socketId, cardName, index, currentDropZone);
            scene.GameHandler.changeTurn();
            scene.GameHandler.players = players;
            scene.DeckHandler.dealCardsInDropzone(currentDropZone);
            scene.playerName?.setText(scene.GameHandler.getPlayerName());
            return true;
        })

        scene.socket.on('cardMovedInHand', (socketId, players, currentDropZone) => {
            if (socketId === scene.socket.id) {
                return scene.DeckHandler.cardMovedInHand(socketId, players, currentDropZone);
            }
            return false;
        })              
    }
}