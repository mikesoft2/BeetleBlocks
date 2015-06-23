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
