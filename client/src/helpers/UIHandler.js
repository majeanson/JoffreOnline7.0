import ZoneHandler from './ZoneHandler';

export default class UIHandler{
    constructor(scene) {

        this.zoneHandler = new ZoneHandler(scene);

        this.buildScoreZone = () => {
            scene.scoreZone = this.zoneHandler.renderZone(960, 100, 1875, 165);
            scene.scoreZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.scoreZone, 0x421942);
        }

        this.buildDropZone = () => {
            scene.dropZone = this.zoneHandler.renderZone(960, 405, 1875, 385);
            scene.dropZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.dropZone, 0x526169);
        }

        this.buildPlayerCardZone = () => {
            scene.playerCardZone = this.zoneHandler.renderZone(960, 750, 1875, 200);
            scene.playerCardZoneOuline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.playerCardZone, 0x5e333c);
            this.buildPlayerCardText();
        }

        this.buildGameText = () => {
            scene.dealCardsText = scene.add.text(50, 20, "Deal cards").setFontSize(54).setFontFamily("Trebuchet MS");
        }

        this.buildPlayerCardText = () => {
            const a = scene.socket.id;
            console.log(a, scene.socket.id);
            scene.playerCardZoneText = scene.add.text(50, 600, '').setFontSize(24).setFontFamily("Trebuchet MS");
            scene.playerCardZoneText.setText(scene.socket.id);
        }

        this.buildUI = () => {
            this.buildScoreZone();
            this.buildDropZone();
            this.buildPlayerCardZone();
            this.buildGameText();          
        }
    }
}