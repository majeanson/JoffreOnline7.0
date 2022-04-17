import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {

        this.allCards = [];
        this.cards = [];
        this.dropZoneCards = [];

        this.dealCardsInHand = (cards) => {

            this.allCards = [];
            this.dropZoneCards = [];
            this.cards?.forEach(card => card.destroy(true));
            this.cards = [];

            let initialIndex = 199.5;
            cards?.forEach(card => {
                const cardName = card?.data?.list?.card;
                if (!this.cards?.find(aCard => aCard.data?.list?.card === cardName)) {
                    const newCard = this.dealCard(initialIndex, card, true)                   
                    initialIndex = initialIndex + 1;
                }
            });
        }

        this.dealRestOfCards = (cards) => {
            let initialIndex = 500; // out of bounds
            cards?.forEach(card => {
                const cardName = card?.data?.list?.card;
                if (!this.cards?.find(aCard => aCard.data?.list?.card === cardName)) {
                    const newCard = this.dealCard(initialIndex, card)
                }
            });
        }


        this.dealCard = (index, card, inHand = false) => {
            let cardToDeal = new Card(scene, card);
            const renderedCard = cardToDeal.render(index, card);
            if (inHand) {
                this.cards.push(renderedCard);
            } else {
                this.allCards.push(renderedCard);
            }
            return renderedCard;
        }

        this.findCard = (cardName) => {
            let foundCard = this.cards?.find(card => card?.data?.list?.card === cardName);
            if (!foundCard) {
                foundCard = this.allCards?.find(card => card?.data?.list?.card === cardName);
            }
            if (!foundCard) {
                foundCard = this.dropZoneCards?.find(card => card?.data?.list?.card === cardName);
            }
            return foundCard;
        }

        this.getGridIndex = (index) => {
            switch (index) {
                case 1: return 82; 
                case 2: return 106;
                case 3: return 126;
                case 4: return 102;
            }
        }

        this.cardPlayed = (socketId, cardName, index, currentDropZone) => {
            const foundCard = this.findCard(cardName);
            const gridIdx = this.getGridIndex(index);
            if (foundCard) {
                scene.aGrid.placeAtIndex(gridIdx, foundCard);
                scene.input.setDraggable(foundCard, false);
                this.dropZoneCards = currentDropZone;
                scene.children.bringToTop(foundCard);
            }      
        }

        this.dealCardsInDropzone = (currentDropZone) => {
            
            this.dropZoneCards = currentDropZone;
            this.dropZoneCards?.forEach((cardName, index) => {
                const foundCard = this.findCard(cardName);
                if (foundCard) {                   
                    scene.aGrid.placeAtIndex(this.getGridIndex(index + 1), foundCard);
                    scene.input.setDraggable(foundCard, false);
                }               
            });
        }

        this.getCardRightBeforeIndex = (upX) => {           
            return this.cards.findIndex(card => upX < card.x);
        }

        this.cardMovedInHand = (socketId, players, currentDropZone) => {
            if (socketId === scene.socket.id) {
                scene.GameHandler.dealCards(socketId, players, currentDropZone);
            }
        }
    }
}
