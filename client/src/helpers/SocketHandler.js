import io from 'socket.io-client';

export default class SocketHandler {
    constructor(scene) {

        scene.socket = io('http://localhost:3000');

        scene.socket.on('connect', () => {
            console.log('Connected ! ');
        })

        scene.socket.on('dealCards', (socketId, players) => {
            scene.GameHandler.dealCards(socketId, players);
        })

        scene.socket.on('changeTurn', () => {
            scene.GameHandler.changeTurn();
        })

        scene.socket.on('changeGameState', (gameState) => {
            scene.GameHandler.changeGameState(gameState);
            scene.dealCardsText.setInteractive(); // to remove
            if (gameState === 'gameReady') {
                scene.dealCardsText.setInteractive();
                scene.dealCardsText.setColor('#12fdfd');
            } else {
                //scene.dealCardsText.disableInteractive(); to readd
                scene.dealCardsText.setColor('#00ffff');
            }
        })

        scene.socket.on('cardPlayed', (socketId, card, index, result) => {
            if (socketId === scene.socket.id && result) {
                return scene.DeckHandler.cardPlayed(socketId, card, index);
            }
            return false;
        })

        scene.socket.on('cardMovedInHand', (socketId, card, index) => {
            console.log(socketId, card);
            if (socketId === scene.socket.id) {
                return scene.DeckHandler.cardMovedInHand(socketId, card, index);
            }
            return false;
        })              
    }
}