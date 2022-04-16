import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {

        this.cards = [];

        this.dealCardsInHand = (cards) => {
            this.cards?.forEach(card => card.destroy(true));
            let initialIndex = 199.5;
            cards?.forEach(card => {
                this.cards.push(this.dealCard(initialIndex, card));
                initialIndex = initialIndex + 1;
            });
        }

        this.dealCard = (index, card) => {
            let cardToDeal = new Card(scene, card);
            return (cardToDeal.render(index, card));
        }

        this.cardPlayed = (socketId, cardName, index, result) => {
            const foundCard = this.cards?.find(card => card.data.list.card === cardName);
            if (foundCard) {
                scene.aGrid.placeAtIndex(104, foundCard);
                scene.input.setDraggable(foundCard, false);
                return result;
            }
            return false;
            
        }

        this.getCardRightBeforeIndex = (upX) => {           
            return this.cards.findIndex(card => upX < card.x);
        }

        this.cardMovedInHand = (socketId, players) => {
            if (socketId === scene.socket.id) {
                scene.GameHandler.dealCards(socketId, players);
            }
        }
    }
}
