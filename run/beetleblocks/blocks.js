// labelPart() proxy
SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function(spec) {
    var part;
    switch (spec) {
        case '%drawStyle':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'lines' : ['lines'],
                    'curves' : ['curves']
                },
                true
        );
        break;
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
        case '%hsla':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'hue' : ['hue'],
                    'saturation' : ['saturation'],
                    'lightness' : ['lightness'],
                    'opacity' : ['opacity']
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
            part = this.originalLabelPart(spec);
        break;
    }
    return part;
};

// Zebra coloring fix
BlockMorph.prototype.originalAlternateBlockColor = BlockMorph.prototype.alternateBlockColor;
BlockMorph.prototype.alternateBlockColor = function () {
    this.originalAlternateBlockColor();
    this.drawNew();
}


// Increase inter-block space

BlockMorph.prototype.originalSnap = BlockMorph.prototype.snap;
BlockMorph.prototype.snap = function() {
    this.originalSnap()
    this.topBlock().fixLayout();
};

SyntaxElementMorph.prototype.originalFixLayout = SyntaxElementMorph.prototype.fixLayout;
SyntaxElementMorph.prototype.fixLayout = function () {
    this.originalFixLayout();
    if (this.nextBlock)	{
        var current = this;
        while (current.nextBlock()) {
            var nb = current.nextBlock();
            if (nb) { nb.setTop(current.bottom() - 2) }
            current = nb;
        }
    }
};

CSlotMorph.prototype.originalInit = CSlotMorph.prototype.init;
CSlotMorph.prototype.init = function() {
    this.originalInit();
    this.dent -= 1;
    this.inset += 2;
};

CSlotMorph.prototype.fixLayout = function () {
    var nb = this.nestedBlock();
    if (nb) {
        nb.setPosition(
            new Point(
                this.left() + this.inset + 1, // inner left 
                this.top() + this.corner + 1 // inner top
            )
        );
        nb.fixLayout();
        this.setHeight(nb.fullBounds().height() + this.corner + 2); // inner bottom
        this.setWidth(nb.fullBounds().width() + (this.cSlotPadding * 2));
    } else {
        this.setHeight(this.corner * 4  + this.cSlotPadding); // default
        this.setWidth(
            this.corner * 4
            + (this.inset * 2)
            + this.dent
            + (this.cSlotPadding * 2)
        ); // default
    }
    if (this.parent.fixLayout) {
        this.parent.fixLayout();
    }
};

// SymbolMorph icons

// Camera SymbolMorph
// Not used anymore, but I'm keeping it here as documentation
// in case we need to add new symbols in the future

/*
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
*/

SymbolMorph.prototype.names.push('largeStage');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;
SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    if (this.name == 'largeStage') {
        return this.drawSymbolLargeStage(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
    } else {
        return this.originalSymbolCanvasColored(aColor)
    }
};

SymbolMorph.prototype.drawSymbolFullScreen = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally outwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 10,
        w = canvas.width / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 1.5;
    ctx.moveTo(c - off, c + off);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.moveTo(c + off, c - off);
    ctx.lineTo(h, 0);
    ctx.stroke();

    ctx.moveTo(0, h);
    ctx.lineTo(0, h - w);
    ctx.stroke();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.moveTo(h, 0);
    ctx.lineTo(h - w, 0);
    ctx.stroke();
    ctx.moveTo(h, 0);
    ctx.lineTo(h, w);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolLargeStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w * 1 / 3,
        h2 = h * 2 / 3;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolNormalStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w / 2,
        h2 = h / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w2, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolSmallStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w * 2 / 3,
        h2 = h * 1 / 3;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w2, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.originalSymbolWidth = SymbolMorph.prototype.symbolWidth;
SymbolMorph.prototype.symbolWidth = function () {
    switch (this.name) {
    case 'gears':
    case 'file':
        return this.originalSymbolWidth() * 2;
    default:
        return this.originalSymbolWidth();
    }
};

SymbolMorph.prototype.drawSymbolGears = function (canvas, color) {
    // overriden to add a small triangle to its right
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 2,
        r = w / 2,
        e = w / 6,
        triangleX = w * 7/6;

    ctx.strokeStyle = color.toString();
    ctx.fillStyle = color.toString();
    ctx.lineWidth = canvas.height / 7;
 
    ctx.beginPath();
    ctx.arc(r, r, e * 1.5, radians(0), radians(360));
    ctx.fill();


    ctx.moveTo(0, r);
    ctx.lineTo(w, r);
    ctx.stroke();

    ctx.moveTo(r, 0);
    ctx.lineTo(r, w);
    ctx.stroke();

    ctx.moveTo(e, e);
    ctx.lineTo(w - e, w - e);
    ctx.stroke();

    ctx.moveTo(w - e, e);
    ctx.lineTo(e, w - e);
    ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';

    ctx.beginPath();
    ctx.arc(r, r, e * 1.5, radians(0), radians(360), true);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // triangle
    ctx.beginPath();
    ctx.moveTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1 + (canvas.width - triangleX - 2) / 2, canvas.height / 5 * 4);
    ctx.lineTo(canvas.width - 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.closePath();
    ctx.fill();
 
    return canvas;
};

SymbolMorph.prototype.drawSymbolFile = function (canvas, color) {
    // overriden to add a small triangle to its right
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 4,
        maxW = canvas.width / 2;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, w);
    ctx.lineTo(maxW, w);
    ctx.lineTo(maxW, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color.darker(25).toString();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(maxW, w);
    ctx.lineTo(w, w);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    // triangle
    ctx.beginPath();
    ctx.moveTo(maxW + 2, canvas.height / 5 * 2);
    ctx.lineTo(maxW + 2 + (canvas.width - maxW - 2) / 2, canvas.height / 5 * 4);
    ctx.lineTo(canvas.width, canvas.height / 5 * 2);
    ctx.lineTo(maxW + 2, canvas.height / 5 * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};
