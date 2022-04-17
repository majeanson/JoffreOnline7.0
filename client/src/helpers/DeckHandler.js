import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {
        this.cardObjects = [];
        this.playerZoneCards = [];
        this.dropZoneCards = [];
        this.deadZoneCards = [];

        this.renderCards = (players, currentDropZone, deadZone) => {
            console.log(players, currentDropZone, deadZone);
            this.playerZoneCards = players[scene.socket.id].inHand;
            this.dropZoneCards = currentDropZone;
            this.deadZoneCards = deadZone;
            console.log(players, currentDropZone, deadZone);
            this.renderPlayerZoneCards();
            this.renderDropZoneCards();
            this.renderDeadZoneCards();
        }

        this.createAndRenderCard = (card, index) => {
            const foundCard = this.findCard(card);
            if (foundCard) {
                scene.aGrid.placeAtIndex(index, foundCard);
                return foundCard;
            } else {
                const newCard = new Card(scene, card);
                const newRenderedCard = newCard.addCardToScene(card, index);
                this.cardObjects.push(newRenderedCard);
                return newRenderedCard;
            }
        }

        this.renderPlayerZoneCards = () => {
            let initialIndex = 199.5;
            this.playerZoneCards?.forEach(card => {
                this.createAndRenderCard(card, initialIndex);
                initialIndex = initialIndex + 1;
            });
        }

        this.renderDropZoneCards = () => {
            this.dropZoneCards?.forEach((card, index) => {
                const newCard = this.createAndRenderCard(card, this.getGridIndex(index + 1));
                scene.input.setDraggable(newCard, false);
            });          
        }
        this.renderDeadZoneCards = () => {
            let initialIndex = 241; // out of bounds
            this.deadZoneCards?.forEach(card => {
                const newCard = this.createAndRenderCard(card, initialIndex);
                scene.input.setDraggable(newCard, true);
            });
        }      

        this.findCard = (cardName) => {
            return this.cardObjects?.find(card => card?.data?.list?.card === cardName);
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

        this.getCardRightBeforeIndex = (upX) => {           
            return this.cards.findIndex(card => upX < card.x);
        }

        this.cardMovedInHand = (socketId, players, currentDropZone, deadZone) => {
            if (socketId === scene.socket.id) {
                scene.GameHandler.refreshCards(players, currentDropZone, deadZone);
            }
        }

        this.endTurn = (currentDropZone, players, deadZone) => {
            this.deadZoneCards?.push(... this.dropZoneCards);         
            this.dropZoneCards = [];
            scene.GameHandler.refreshCards(players, currentDropZone, deadZone);
        }
    }
}
