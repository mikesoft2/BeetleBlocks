// labelPart() proxy
SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;

SyntaxElementMorph.prototype.labelPart = function(spec) {
	var part;
	switch (spec) {
		case '%axes':
			part = new InputSlotMorph(
					null,
					false,
					{
					'x' : ['x'],
					'y' : ['y'], 
					'z' : ['z']
					},
					true
					);
			break;
		case '%directions':
			part = new InputSlotMorph(
					null,
					false,
					{
					'right' : ['right'],
					'up' : ['up']
					},
					true
					);
			break;
		case '%hsl':
			part = new InputSlotMorph(
					null,
					false,
					{
					'hue' : ['hue'],
					'saturation' : ['saturation'],
					'lightness' : ['lightness']
					},
					true
					);
			break;
		case '%lookat':
			part = new InputSlotMorph(
					null,
					false,
					{
					'beetle' : ['beetle'],
					'origin' : ['origin']
					},
					true
					);
			break;
		default:
			part = SyntaxElementMorph.prototype.originalLabelPart(spec);
	}
	return part;
}


// Camera SymbolMorph

SymbolMorph.prototype.names.push('camera');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;

SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
	if (this.name == 'camera') {
		return this.drawSymbolCamera(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
	} else {
		return this.originalSymbolCanvasColored(aColor)
	}
}

SymbolMorph.prototype.drawSymbolCamera = function (canvas, color) {
	// answer a canvas showing a camera symbol
	var ctx = canvas.getContext('2d'),
		w = canvas.width,
		h = canvas.height;

	ctx.fillStyle = color.toString();

	ctx.fillRect(0, h/4, w*3/4, h/2);

	ctx.beginPath();
	ctx.moveTo(w, h*3/4);
	ctx.lineTo(w/2, h/2);
	ctx.lineTo(w, h/4);
	ctx.lineTo(w, h*3/4);
	ctx.closePath();
	ctx.fill();

	return canvas;
};

