SpriteMorph.prototype.initBeetle = function() {
	var myself = this;

	this.beetle = new THREE.Object3D();
	this.beetle.name = 'beetle';

	this.beetle.color = new THREE.Color();
	this.beetle.material = new THREE.MeshLambertMaterial( { color: this.beetle.color } );
	this.beetle.geometry = new THREE.CylinderGeometry( 0, 0.25, 0.7, 32);

	this.beetle.shape = new THREE.Mesh(this.beetle.geometry, this.beetle.material);
	this.beetle.shape.rotation.x = toRad(90);
	this.beetle.shape.position.z = 0.35;
	this.beetle.shape.name = 'beetleShape';

	this.beetle.posAndRotStack = new Array();

	// extrusion
	this.beetle.extruding = false;
	this.beetle.currentExtrusion = null;

	// drawing
	this.beetle.drawing = false;

	this.beetle.reset = function() {	
		this.position.set(0,0,0);
		this.rotation.set(0,0,0);
	}

	this.beetle.resetColor = function() {	
		myself.beetle.color.setHSL(0.05,0.5,0.5);
		myself.beetle.getObjectByName("beetleShape").material.color = myself.beetle.color;
	}

	this.beetle.add(this.beetle.shape);

	this.beetle.reset();
	this.beetle.resetColor()

	// beetle's local axis lines
	p = new THREE.Vector3(1,0,0);
	addLineToPointWithColorToObject(p, 0x00FF00, this.beetle);
	p = new THREE.Vector3(0,1,0);
	addLineToPointWithColorToObject(p, 0x0000FF, this.beetle);
	p = new THREE.Vector3(0,0,1);
	addLineToPointWithColorToObject(p, 0xFF0000, this.beetle);

	scene.add(this.beetle);
}

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;

SpriteMorph.prototype.init = function (globals) {
	this.initBeetle();
	this.originalInit(globals);
}


// Definition of a new BeetleBlocks Category

SpriteMorph.prototype.categories.push('beetleblocks');
SpriteMorph.prototype.blockColor['beetleblocks'] = new Color(154, 149, 9);

// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;

SpriteMorph.prototype.initBlocks = function() {
	
	this.originalInitBlocks();

	this.blocks.clear =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'clear',
			category: 'beetleblocks'
	};
	this.blocks.goHome =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'go home',
			category: 'beetleblocks'
	};		

	this.blocks.move =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'move %n',
			category: 'beetleblocks',
			defaults: [1]
	};
	this.blocks.rotate =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'rotate %axes by %n',
			category: 'beetleblocks',
			defaults: ['z',15]
	};

	this.blocks.setPosition =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'go to x: %n y: %n z: %n',
			category: 'beetleblocks',
			defaults: [0, 0, 0]
	};
	this.blocks.setPositionOnAxis =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'set %axes to %n',
			category: 'beetleblocks',
			defaults: ['x', 0]
	};
	this.blocks.changePositionBy =
	{
			only: SpriteMorph,
			type:'command', 
			spec: 'change %axes by %n',
			category: 'beetleblocks',
			defaults: ['x', 1]
	};
	this.blocks.setRotationOnAxis =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'set %axes rotation to %n',	
			category: 'beetleblocks',
			defaults: ['z', 0]
	};
	this.blocks.pointTowards =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'point towards x: %n y: %n z: %n',
			category: 'beetleblocks',
			defaults: [0, 0, 0]
	};
	this.blocks.getPosition =
	{
			only: SpriteMorph,
			type:'reporter',
			spec: '%axes position',
			category: 'beetleblocks',
			defaults: ['x']
	};
	this.blocks.getRotation =
	{
			only: SpriteMorph,
			type:'reporter',
			spec: '%axes rotation',
			category: 'beetleblocks',
			defaults: ['z']
	};
	this.blocks.pushPosition =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'push position',
			category: 'beetleblocks'
	};
	this.blocks.popPosition =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'pop position',
			category: 'beetleblocks'
	};

	this.blocks.cube =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'cube size %n',
			category: 'beetleblocks',
			defaults: [0.5]
	};
	this.blocks.cuboid =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'cuboid l: %n w: %n h: %n',
			category: 'beetleblocks',
			defaults: [1, 0.5, 0.3]
	};
	this.blocks.sphere =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'sphere diameter %n',
			category: 'beetleblocks',
			defaults: [0.5]		
	};
	this.blocks.tube =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'tube l: %n outer: %n inner: %n',
			category: 'beetleblocks',
			defaults: [2, 1, 0.5]
	};
	this.blocks.text =
	{
			only: SpriteMorph,
			type:'command', 
			spec: 'text %s height %n depth %n',
			category: 'beetleblocks',
			defaults: ['hello world', 1, 0.5]
	};
	this.blocks.startDrawing =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'start drawing',
			category: 'beetleblocks'
	};		 
	this.blocks.stopDrawing =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'stop drawing',
			category: 'beetleblocks'
	};

	this.blocks.startExtrusion =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'start extruding',
			category: 'beetleblocks'
	};
	this.blocks.stopExtrusion =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'stop extruding',
			category: 'beetleblocks'
	};

	this.blocks.setHSL =
	{
			only: SpriteMorph,
			type:'command', 
			spec: 'set %hsl to %n',	
			category: 'beetleblocks',
			defaults: ['hue', 50]
	};
	this.blocks.changeHSL =
	{
			only: SpriteMorph,
			type:'command', 
			spec: 'change %hsl by %n',
			category: 'beetleblocks',
			defaults: ['hue', 10]
	};
	this.blocks.getHSL =
	{
			only: SpriteMorph,
			type:'reporter',
			spec: 'color %hsl',
			category: 'beetleblocks'
	};

}

SpriteMorph.prototype.initBlocks();

// blockTemplates proxy

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;

// Definition of our new primitive blocks

SpriteMorph.prototype.blockTemplates = function(category) {
	var myself = this;

	var blocks = myself.originalBlockTemplates(category); 

	function blockBySelector(selector) {
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

	if (category === 'beetleblocks') {
		blocks.push(blockBySelector('clear'));
		blocks.push(blockBySelector('goHome'));
		blocks.push('-');
		blocks.push(blockBySelector('move'));
		blocks.push(blockBySelector('rotate'));
		blocks.push('-');
		blocks.push(blockBySelector('setPosition'));
		blocks.push(blockBySelector('setPositionOnAxis'));
		blocks.push(blockBySelector('changePositionBy'));
		blocks.push(blockBySelector('setRotationOnAxis'));
		blocks.push(blockBySelector('pointTowards'));
		blocks.push(blockBySelector('getPosition'));
		blocks.push(blockBySelector('getRotation'));
		blocks.push(blockBySelector('pushPosition'));
		blocks.push(blockBySelector('popPosition'));
		blocks.push('-');
		blocks.push(blockBySelector('cube'));
		blocks.push(blockBySelector('cuboid'));
		blocks.push(blockBySelector('sphere'));
		blocks.push(blockBySelector('tube'));
		blocks.push(blockBySelector('text'));
		blocks.push(blockBySelector('startDrawing'));
		blocks.push(blockBySelector('stopDrawing'));
		blocks.push(blockBySelector('startExtrusion'));
		blocks.push(blockBySelector('stopExtrusion'));
		blocks.push('-');
		blocks.push(blockBySelector('setHSL'));
		blocks.push(blockBySelector('changeHSL'));
		blocks.push(blockBySelector('getHSL'));
	};

	return blocks;
}

StageMorph.prototype.originalInit = StageMorph.prototype.init;

StageMorph.prototype.init = function (globals) {
    this.originalInit(globals);
    this.trailsCanvas = renderer.domElement;
};

StageMorph.prototype.originalStep = StageMorph.prototype.step;

StageMorph.prototype.step = function () {
    this.originalStep();

    // update Beetleblocks, if needed
    renderCycle(this);
};

StageMorph.prototype.referencePos = null;

StageMorph.prototype.mouseScroll = function (y, x) {
    if (y > 0) {
        controls.dollyOut();
    } else if (y < 0) {
        controls.dollyIn();
    }
    controls.update();
    reRender();
};

StageMorph.prototype.mouseDownLeft = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseDownRight = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseMove = function (pos) {
    deltaX = pos.x - this.referencePos.x;
    deltaY = pos.y - this.referencePos.y;
    this.referencePos = pos
    if (this.world().currentKey === 16) { // shiftClicked
        controls.panLeft(deltaX / this.dimensions.x / this.scale * 15);
        controls.panUp(deltaY / this.dimensions.y / this.scale * 10);
    } else {
        horzAngle = deltaX / (this.dimensions.x * this.scale) * 360;
        vertAngle = deltaY / (this.dimensions.y * this.scale) * 360;
        controls.rotateLeft(radians(horzAngle));
        controls.rotateUp(radians(vertAngle));
    }
    controls.update();
    reRender();
};
