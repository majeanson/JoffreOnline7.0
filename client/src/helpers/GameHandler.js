export default class GameHandler {
    constructor(scene) {

        this.gameState = 'init';
        this.gameStateMessage = 'Bienvenue';
        this.player1Deck = [];
        this.player2Deck = [];
        this.player3Deck = [];
        this.player4Deck = [];

        this.players = {};

        this.isCurrentPlayerTurnDeck = () => {
            const currentPlayer = this.getCurrentPlayer();
            return currentPlayer ? currentPlayer['isDeckHolder'] === true : false;
        }

        this.changeGameState = (gameState, message = '') => {
            this.gameState = gameState;
            if (message) {
                this.gameStateMessage = message;
            } else {
                this.gameStateMessage = this.getGameStateMessage();
            }
        }

        this.getGameStateMessage = () => {
            switch (this.gameState) {
                case 'lobby': return 'Lobby en attente de joueurs'; break;
                case 'gameReady': return 'La partie est prète à débuter'; break;
            }
            
        }

        this.dealCards = (socketId, players) => {
            this.players = players;
            this.player1Deck = this.players[Object.keys(this.players)[0]]?.inHand;
            this.player2Deck = this.players[Object.keys(this.players)[1]]?.inHand;
            this.player3Deck = this.players[Object.keys(this.players)[2]]?.inHand;
            this.player4Deck = this.players[Object.keys(this.players)[3]]?.inHand;
            console.log(this.player1Deck, this.player2Deck, this.player3Deck, this.player4Deck);

            this.dealCardsInHand();
        }

        this.getCurrentPlayer = () => {
            return this.players[scene.socket.id];
        }

        this.dealCardsInHand = () => {
            scene.DeckHandler.dealCardsInHand(this.getCurrentPlayer().inHand);
        }

        this.changeTurn = () => {
            let currentPlayerTurn = this.playerTurn;
            switch (currentPlayerTurn) {
                case 'player1':
                    this.playerTurn = 'player2';
                    break;
                case 'player2':
                    this.playerTurn = 'player3';
                    break;
                case 'player3':
                    this.playerTurn = 'player4';
                    break;
                case 'player4':
                    this.playerTurn = 'player1';
                    break;
                
            } 
        }

    }
}