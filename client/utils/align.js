export default class Align
{
	static scaleToGameW(game, obj,per)
	{
		obj.displayWidth=game.config.width*per;
		obj.scaleY=obj.scaleX;
	}
	static centerH(obj)
	{
		obj.x = this.game.config.width/2-obj.displayWidth/2;
	}
	static centerV(obj)
	{
		obj.y = this.game.config.height/2-obj.displayHeight/2;
	}
	static center2(obj)
	{
		obj.x = this.game.config.width/2-obj.displayWidth/2;
		obj.y = this.game.config.height/2-obj.displayHeight/2;
	}
	static center(obj)
	{
		obj.x = this.game.config.width/2;
		obj.y = this.game.config.height/2;
	}
}