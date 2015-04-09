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
	this.color = new Color(255,255,255);
    this.refresh();
    this.drawNew();
}
