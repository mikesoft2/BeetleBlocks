ToggleMorph.prototype.originalInit = ToggleMorph.prototype.init;
ToggleMorph.prototype.init = function (
	title,
    purpose,
    tosURL,
    tosLabel,
    prvURL,
    prvLabel,
    checkBoxLabel,
    world,
    pic,
    msg
) {
	this.originalInit(title, purpose, tosURL, tosLabel, prvURL, prvLabel, checkBoxLabel, world, pic, msg);	
	this.color = new Color(0,0,0);
	this.highlightColor = new Color(100,100,100);
	this.alpha = 0.25;
    this.refresh();
    this.drawNew();
}
