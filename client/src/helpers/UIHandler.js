import ZoneHandler from './ZoneHandler';
import Align from '../../utils/align.js';

export default class UIHandler{
    constructor(scene) {

        this.zoneHandler = new ZoneHandler(scene);

        this.buildScoreZone = () => {
            scene.scoreZone = this.zoneHandler.renderZone(960, 100, 1875, 165);
        }

        this.buildDropZone = () => {
            scene.dropZone = this.zoneHandler.renderZone(-100, 350, 4650, 385);
            scene.dropZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.dropZone, 0x526169);
        }

        this.buildPlayerCardZone = () => {
            scene.playerCardZone = this.zoneHandler.renderZone(960, 750, 1875, 200);
            this.buildPlayerCardText();
        }

        this.buildGameText = () => {
            scene.backCard = scene.add.image(0, 0, 'back').setInteractive();
            scene.aGrid.placeAtIndex(20, scene.backCard);
            Align.scaleToGameW(scene.game, scene.backCard, 0.1);
            scene.messageStatus = scene.add.text(20, 20, "Message status").setFontSize(24).setFontFamily("Trebuchet MS");
            scene.messageStatus.setText(scene.GameHandler.gameStateMessage);
            
        }

        this.buildPlayerCardText = () => {
            scene.playerName = scene.add.text(0, 0, '').setFontSize(18).setFontFamily("Trebuchet MS");
            scene.aGrid.placeAtIndex(231, scene.playerName);
            scene.playerName.setText(scene.GameHandler.getPlayerName());
        }

        this.buildUI = () => {
            this.buildScoreZone();
            this.buildDropZone();
            this.buildPlayerCardZone();
            this.buildGameText();          
        }
    }
}