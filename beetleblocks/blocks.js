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

