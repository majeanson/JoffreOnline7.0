export default class GameHandler {
    constructor(scene) {

        this.gameState = 'init';
        this.gameStateMessage = 'Bienvenue';
        this.playerTurn = 'player1';

        this.players = {};

        this.isCurrentPlayerTurnDeck = () => {
            const currentPlayer = this.getCurrentPlayer();
            return currentPlayer ? currentPlayer['isMyTurn'] === true : false;
        }

        this.getPlayerName = () => {
            let foundIndex = -1;
            Object.keys(this.players).forEach((socketId, index) => {
                if (socketId === scene.socket.id) {
                    foundIndex = index
                }
            });
            
            const isMyTurn = this.players[Object.keys(this.players)[foundIndex]]?.isMyTurn;
            const isDeckHolder = this.players[Object.keys(this.players)[foundIndex]]?.isDeckHolder;         
            let text = scene.socket.id + ' Joueur ' + (foundIndex + 1);
            isMyTurn ? text = text + ' -\u00C0 vous de jouer !' : '';
            isDeckHolder ? text = text + ' [DEALER]' : '';
            return text;
        }

        this.changeGameState = (gameState, message = '') => {
            this.gameState = gameState;
            if (message) {
                this.gameStateMessage = message;
            } else {
                this.gameStateMessage = this.getGameStateMessage();
            }
            scene.messageStatus.setText(this.gameStateMessage);
            scene.playerName?.setText(scene.GameHandler.getPlayerName());
        }

        this.getGameStateMessage = () => {
            switch (this.gameState) {
                case 'lobby': return 'Lobby en attente de joueurs'; break;
                case 'gameReady': return 'La partie est prète à débuter'; break;
            }
            
        }

        this.refreshCards = (players, currentDropZone, deadZone) => {
            if (players) {
                this.players = players;
            }
            scene.DeckHandler.renderCards(players, currentDropZone, deadZone);
        }

        this.getCurrentPlayer = () => {
            return this.players[scene.socket.id];
        }

        this.getCurrentTurnIdx = () => {
            let currentTurnIdx = 0;
            Object.values(this.players).forEach((player, idx) => {
                if (player.isMyTurn) {
                    currentTurnIdx = idx;
                }
            });
            return currentTurnIdx;
        }


        this.changeTurn = () => {
            let currentTurnIdx = this.getCurrentTurnIdx();
            let nextTurnIdx = currentTurnIdx + 1;
            if (nextTurnIdx === 4 /* last */) {
                nextTurnIdx = 0;
            }
            Object.values(this.players).forEach((player, idx, arr) => {
                if (idx === currentTurnIdx) {
                    arr[idx].isMyTurn = false;
                } else if (idx === nextTurnIdx) {
                    arr[idx].isMyTurn = true;
                }
            });           
            this.changeGameState(this.gameState, "C'est au joueur " + (nextTurnIdx + 1) + ' de jouer')
        }

        this.endTurn = (currentDropZone, players, deadZone, winningPlayerIndex) => {
            this.changeGameState(this.gameState, "Le joueur " + (winningPlayerIndex + 1) + ' a remporter la lev\u00E9e. \u000A' + "C'est \u00E0 son tour.");
            scene.DeckHandler.endTurn(currentDropZone, players, deadZone);
        }

    }
}