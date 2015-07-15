BlockDialogMorph.prototype.originalInit = BlockDialogMorph.prototype.init;
BlockDialogMorph.prototype.init = function (target, action, environment) {
    var myself = this;
    this.originalInit(target, action, environment);
    this.category = 'my blocks';
    this.categories.children.forEach(function (each) { each.refresh() });
    if (this.types) {
        this.types.children.forEach(function (each) {
                each.setColor(SpriteMorph.prototype.blockColor['my blocks']);
            });
    }
    this.edit();
}

BlockEditorMorph.prototype.originalPopUp = BlockEditorMorph.prototype.popUp;
BlockEditorMorph.prototype.popUp = function () {
    var size = IDE_Morph.prototype.getSetting('editor-size'),
        myself = this;

    if (size) { 
        var sizeArray = size.split(',');
        this.setExtent(new Point(Number(sizeArray[0]), Number(sizeArray[1])));
        this.drawNew()
        this.fixLayout();
    }

    this.originalPopUp();

    this.handle.originalMouseDownLeft = this.handle.mouseDownLeft;
    this.handle.mouseDownLeft = function (pos) {
        this.originalMouseDownLeft(pos);
        this.originalStep = this.step;
        this.step = function() {
            this.originalStep();
            IDE_Morph.prototype.saveSetting('editor-size', myself.extent().asArray());
        }
    }
}


BlockExportDialogMorph.prototype.exportBlocks = function () {
    var str = this.serializer.serialize(this.blocks),
        data,
        blob;

    if (this.blocks.length > 0) {
        data = ('<blocks app="'
                + this.serializer.app
                + '" version="'
                + this.serializer.version
                + '">'
                + str
                + '</blocks>');
    } else {
        new DialogBoxMorph().inform(
                'Export blocks',
                'no blocks were selected',
                this.world()
                );
    }

    blob = new Blob([data], {type: 'text/xml;charset=utf-8'});
    saveAs(blob, (this.projectName ? this.projectName : 'beetleblocks_block_export') + '.xml');
};
