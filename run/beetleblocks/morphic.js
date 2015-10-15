Morph.fromImageURL = function(url) {
    var m = new Morph();

    m.texture = url;

    m.drawNew = function() {
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, this.width(), this.height());
        if (this.texture) {
            this.drawTexture(this.texture);
        }
    }

    m.drawCachedTexture = function () {
        var context = this.image.getContext('2d');
        context.drawImage(
            this.cachedTexture,
            0,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    m.drawNew();

    m.setExtent(new Point(m.cachedTexture.width, m.cachedTexture.height));

    return m;
}

WorldMorph.prototype.flushKeyboardState = function() {
    this.currentKey = null; 
}

WorldMorph.prototype.originalInit = WorldMorph.prototype.init;
WorldMorph.prototype.init = function(aCanvas, fillPage) {
    var myself = this;

    this.originalInit(aCanvas, fillPage);

    aCanvas.onblur = function() { myself.flushKeyboardState};
    aCanvas.onmouseout = function() { myself.flushKeyboardState };
}

var TriangleBoxMorph;

TriangleBoxMorph.prototype = new Morph();
TriangleBoxMorph.prototype.constructor = TriangleBoxMorph;
TriangleBoxMorph.uber = Morph.prototype;

function TriangleBoxMorph(orientation) {
    this.init(orientation);
}

TriangleBoxMorph.prototype.init = function (orientation) {
    TriangleBoxMorph.uber.init.call(this);
    this.orientation = orientation ? orientation : 'left';
    this.setExtent(new Point(20, 28));
}

TriangleBoxMorph.prototype.drawNew = function () {
    var context,
    ext,
    myself = this;

    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');

    context.fillStyle = myself.color.toString();
    context.beginPath();

    if (this.orientation == 'left') {
        context.moveTo(0,  14);
        context.lineTo(20, 0);
        context.lineTo(20, 28);	
    } else if (this.orientation == 'right') {
        context.moveTo(0,  0);
        context.lineTo(20, 14);
        context.lineTo(0,  28);	
    } else if (this.orientation == 'top') {
        context.moveTo(0,  0);
        context.lineTo(10, 28);
        context.lineTo(20,  0);	
    } else if (this.orientation == 'bottom') {
        context.moveTo(0,  28);
        context.lineTo(10, 0);
        context.lineTo(20,  28);	
    }


    context.closePath();
    context.fill();
};

var AnimationMorph;

AnimationMorph.prototype = new Morph();
AnimationMorph.prototype.constructor = AnimationMorph;
AnimationMorph.uber = Morph.prototype;

function AnimationMorph(path, frameCount, fps, callback) {
    this.init(path, frameCount, fps, callback);
}

AnimationMorph.prototype.init = function(path, frameCount, frameDuration, callback) {
    this.path = path;
    this.frameCount = frameCount;
    this.frameDuration = frameDuration || 1; // frames per rendering cycle
    this.frames = [];
    this.lastFrameTime = Date.now();
    this.currentFrameIndex = 0;

    this.loadImages(callback);
    this.stepFrame();
}

AnimationMorph.prototype.loadImages = function(callback) {
    var myself = this;

    for (i = 0; i < this.frameCount; i++ ) {
        img = new Image();
        img.src = this.path + 'Frame (' + i + ').jpg';
        myself.frames.push(img);
        img.onload = function() { 
            myself.setExtent(new Point(this.width, this.height));
            myself.image.width = this.width;
            myself.image.height = this.height;
            if (callback) { callback() };
        };
    };
}

AnimationMorph.prototype.currentFrame = function() {
    return this.frames[this.currentFrameIndex];
}

AnimationMorph.prototype.drawNew = function () {
    var context = this.image.getContext('2d');
    context.clearRect(0, 0, this.width(), this.height());
    context.drawImage(this.currentFrame(), 0, 0, this.width(), this.height());
};

AnimationMorph.prototype.step = function() {
    if (Date.now() - this.lastFrameTime >= this.frameDuration) {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameCount;
        this.lastFrameTime = Date.now();
        this.changed();
        this.drawNew();
    }
}
