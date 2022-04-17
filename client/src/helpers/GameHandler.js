export default class GameHandler {
    constructor(scene) {

        this.gameState = 'init';
        this.gameStateMessage = 'Bienvenue';
        this.player1Deck = [];
        this.player2Deck = [];
        this.player3Deck = [];
        this.player4Deck = [];
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

        this.dealCards = (socketId, players, currentDropZone) => {
            this.cards = [];
            if (players) {
                this.players = players;
                this.player1Deck = this.players[Object.keys(this.players)[0]]?.inHand;
                this.player2Deck = this.players[Object.keys(this.players)[1]]?.inHand;
                this.player3Deck = this.players[Object.keys(this.players)[2]]?.inHand;
                this.player4Deck = this.players[Object.keys(this.players)[3]]?.inHand;
            }
            this.dealCardsInHand();           
            this.dealCardsInDropzone(currentDropZone);
            this.dealRestOfCards();

            
        }

        this.getCurrentPlayer = () => {
            return this.players[scene.socket.id];
        }

        this.dealCardsInHand = () => {
            scene.DeckHandler.dealCardsInHand(this.getCurrentPlayer()?.inHand);
        }
        this.dealRestOfCards = () => {
            Object.keys(this.players).forEach(socketId => {
                if (socketId !== scene.socket.id) {
                    scene.DeckHandler.dealRestOfCards(this.players[socketId].inHand);
                }
            });            
        }
    

        this.dealCardsInDropzone = (currentDropZone) => {
            scene.DeckHandler.dealCardsInDropzone(currentDropZone);
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
            const currentTurnIdx = this.getCurrentTurnIdx();
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

    }
}