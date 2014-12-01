// THREE additions
THREE.Object3D.prototype.addLineToPointWithColor = function(point, color) {
	return this.addLineFromPointToPointWithColor(new THREE.Vector3(), point, color)
}

THREE.Object3D.prototype.addLineFromPointToPointWithColor = function(originPoint, destinationPoint, color) {
	geometry = new THREE.Geometry();
	geometry.vertices.push(originPoint);
	geometry.vertices.push(destinationPoint);
	var lineMaterial = new THREE.LineBasicMaterial({ color: color });
	var line = new THREE.Line(geometry, lineMaterial);
	this.add(line);
	return line;
}


// SpriteMorph
SpriteMorph.prototype.initBeetle = function() {
	var myself = this;

	this.beetle = new THREE.Object3D();
	this.beetle.name = 'beetle';
	this.beetle.color = new THREE.Color();

	var material = new THREE.MeshLambertMaterial( { color: this.beetle.color } );
	var geometry = new THREE.CylinderGeometry( 0, 0.25, 0.7, 32);

	this.beetle.shape = new THREE.Mesh(geometry, material);
	this.beetle.shape.rotation.x = radians(90);
	this.beetle.shape.position.z = 0.35;
	this.beetle.shape.name = 'beetleShape';

	this.beetle.posAndRotStack = new Array();

	// extrusion
	this.beetle.extruding = false;
	this.beetle.currentExtrusion = null;
	this.beetle.extrusionRadius = 1;

	// drawing
	this.beetle.drawing = false;

	this.beetle.reset = function() {	
		this.position.set(0,0,0);
		this.rotation.set(0,0,0);
	}

	this.beetle.resetColor = function() {	
		myself.beetle.color.setHSL(0.05,0.5,0.5);
		myself.beetle.getObjectByName('beetleShape').material.color = myself.beetle.color;
	}

	this.beetle.add(this.beetle.shape);

	this.beetle.reset();
	this.beetle.resetColor()

	this.beetle.axes = [];
	// beetle's local axis lines
	p = new THREE.Vector3(1,0,0);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0x00FF00));
	p = new THREE.Vector3(0,1,0);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0x0000FF));
	p = new THREE.Vector3(0,0,1);
	this.beetle.axes.push(this.beetle.addLineToPointWithColor(p, 0xFF0000));
}

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;

SpriteMorph.prototype.init = function(globals) {
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

	this.blocks.showBeetle =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'show beetle',
			category: 'beetleblocks'
	};	
	this.blocks.hideBeetle =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'hide beetle',
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
	this.blocks.setExtrusionRadius =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'set extrusion radius to %n',
			category: 'beetleblocks',
			defaults: [1]
	};
	this.blocks.changeExtrusionRadius =
	{
			only: SpriteMorph,
			type:'command',
			spec: 'change extrusion radius by %n',
			category: 'beetleblocks',
			defaults: [1]
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
		blocks.push(blockBySelector('showBeetle'));
		blocks.push(blockBySelector('hideBeetle'));
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
		blocks.push(blockBySelector('setExtrusionRadius'));
		blocks.push(blockBySelector('changeExtrusionRadius'));
		blocks.push('-');
		blocks.push(blockBySelector('setHSL'));
		blocks.push(blockBySelector('changeHSL'));
		blocks.push(blockBySelector('getHSL'));
	};

	return blocks;
}

// Single Sprite mode

SpriteMorph.prototype.drawNew = function () { this.hide() }

// StageMorph

StageMorph.prototype.originalDestroy = StageMorph.prototype.destroy;

StageMorph.prototype.destroy = function() {
	var myself = this;
	this.scene.remove(this.myObjects);
	this.children.forEach(function(eachSprite) {
		myself.parentThatIsA(IDE_Morph).removeSprite(eachSprite);
	});
	this.originalDestroy();
}

StageMorph.prototype.originalInit = StageMorph.prototype.init;
StageMorph.prototype.init = function(globals) {
    this.originalInit(globals);
	this.initRenderer();
	this.initScene();
	this.initLights();
	this.initCamera();
	
	this.myObjects = new THREE.Object3D();
	this.scene.add(this.myObjects);

    this.trailsCanvas = this.renderer.domElement;
};

StageMorph.prototype.initScene = function() {
	var myself = this;
	this.scene = new THREE.Scene();
	this.scene.axes = [];
	this.scene.grid = {};
	this.scene.grid.defaultColor = 0xAAAAAA;
	this.scene.grid.visible = false;
	this.scene.grid.interval = new Point(1, 1);

	// Grid
	this.scene.grid.draw = function() {
		var color = this.lines? this.lines[0].material.color : this.defaultColor;
		if (this.lines) {
			this.lines.forEach(function(eachLine){
				myself.scene.remove(eachLine)
			});
			this.lines = [];
		}
		this.lines = [];
		for (x = 0; x <= 10 / this.interval.x; x++) {
			p1 = new THREE.Vector3(x * this.interval.x, 0, 0);
			p2 = new THREE.Vector3(x * this.interval.x, 0, 10);
			l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
			l.visible = this.visible;
			this.lines.push(l);
		}
		for (y = 0; y <= 10 / this.interval.y; y++) {
			p1 = new THREE.Vector3(0, 0, y * this.interval.y);
			p2 = new THREE.Vector3(10, 0, y * this.interval.y);
			l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
			l.visible = this.visible;
			this.lines.push(l);
		}
		myself.reRender();
	}

	this.scene.grid.setInterval = function(aPoint) {
		this.interval = aPoint;
		this.draw();
	}

	this.scene.grid.setColor = function(color) {
		this.lines.forEach(function(eachLine) {
			eachLine.material.color.setHex(color);
		})
	};

	this.scene.grid.toggle = function() {
		var myInnerSelf = this;
		this.visible = !this.visible;
		this.lines.forEach(function(line){ line.visible = myInnerSelf.visible });
		myself.reRender();
	}

	this.scene.grid.draw();

	// Axes
	p = new THREE.Vector3(5,0,0);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0x00FF00));
	p = new THREE.Vector3(0,5,0);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0x0000FF));
	p = new THREE.Vector3(0,0,5);
	this.scene.axes.push(this.scene.addLineToPointWithColor(p, 0xFF0000));
}

StageMorph.prototype.initRenderer = function() {
	var myself = this,
      dpr = window.devicePixelRatio;
	
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(480 / dpr, 360 / dpr); // ugly! this.width(), this.height() is not set yet!
	this.renderer.setClearColor(0xCCCCCC, 1);
	this.renderer.changed = false;
	this.renderer.isWireframeMode = false;
	this.renderer.showingAxes = true;
	this.renderer.isParallelProjection = false;

	this.renderer.toggleWireframe = function() {
		var myInnerSelf = this;
		this.isWireframeMode = !this.isWireframeMode;
		myself.myObjects.children.forEach(function(eachObject) {
			eachObject.material.wireframe = myInnerSelf.isWireframeMode;
		});
		myself.reRender();
	}

	this.renderer.toggleAxes = function() {
		var myInnerSelf = this;
		this.showingAxes = !this.showingAxes;

		myself.scene.axes.forEach(function(line){ line.visible = myInnerSelf.showingAxes });
		myself.children.forEach(function(morph) {
			if (morph instanceof SpriteMorph) {
				morph.beetle.axes.forEach(function(line){ line.visible = myInnerSelf.showingAxes });
			}
		})
		myself.reRender();
	}

	this.renderer.toggleParallelProjection = function() {
		this.isParallelProjection = !this.isParallelProjection;
		myself.initCamera();
	}
}


StageMorph.prototype.render = function() {
	this.pointLight.position.copy(this.camera.position); // pointlight moves with the camera
	this.renderer.render(this.scene, this.camera);
};

StageMorph.prototype.renderCycle = function() {
   	if (this.renderer.changed){
		this.render();
		this.changed();
		this.renderer.changed = false;
	}
}

StageMorph.prototype.reRender = function() {
    this.renderer.changed = true;
}

StageMorph.prototype.initCamera = function() {
	var myself = this;

	if (this.scene.camera) { this.scene.remove(this.camera) };

	if (this.renderer.isParallelProjection) { 
		// At init time Stage size is not yet set, so this cannot be the default projection
		this.camera = new THREE.OrthographicCamera(
			this.width() / - this.camera.zoomFactor,
			this.width() / this.camera.zoomFactor,
			this.height() / this.camera.zoomFactor,
			this.height() / - this.camera.zoomFactor,
			0.1, 
			1000);
	} else {
		this.camera = new THREE.PerspectiveCamera(60, 480/360, 1, 1000)
	};
	
	this.scene.add(this.camera);

	var threeLayer = document.createElement('div');

	this.controls = new THREE.OrbitControls(this.camera, threeLayer);
	this.controls.addEventListener('change', function(event) { myself.render });

	// We need to implement zooming ourselves for parallel projection

	this.camera.zoomIn = function() {
		this.zoomFactor /= 1.1;
		this.applyZoom();
	}
	this.camera.zoomOut = function() {
		this.zoomFactor *= 1.1;
		this.applyZoom();
	}

	this.camera.applyZoom = function() {
		this.left = myself.width() / - this.zoomFactor;
	    this.right = myself.width() / this.zoomFactor;
	    this.top = myself.height() / this.zoomFactor;
	    this.bottom = myself.height() / - this.zoomFactor;
    	this.updateProjectionMatrix();	
	}

	this.camera.reset = function() {
		if (myself.renderer.isParallelProjection) {
			this.zoomFactor = 82;
			this.applyZoom();
		}
		this.position.x = -5;
		this.position.y = 7;
		this.position.z = 5;
		this.lookAt(new THREE.Vector3());
		myself.reRender();
	}

	this.camera.reset();
}

StageMorph.prototype.initLights = function() {
	var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 0);
	this.scene.add(directionalLight);

	this.pointLight = new THREE.PointLight(0xffffff, 1, 200);
	this.pointLight.position.set(10, 10, 10);
	this.scene.add(this.pointLight);
}

StageMorph.prototype.originalStep = StageMorph.prototype.step;
StageMorph.prototype.step = function() {
    this.originalStep();

    // update Beetleblocks, if needed
    this.renderCycle();
};

StageMorph.prototype.referencePos = null;

StageMorph.prototype.mouseScroll = function(y, x) {
	if (this.renderer.isParallelProjection) {
	    if (y > 0) {
			this.camera.zoomOut();
    	} else if (y < 0) {
			this.camera.zoomIn();
	    }
	} else {
	    if (y > 0) {
	        this.controls.dollyOut();
    	} else if (y < 0) {
        	this.controls.dollyIn();
	    }
	    this.controls.update();
	}
    this.reRender();
};

StageMorph.prototype.mouseDownLeft = function(pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseDownRight = function(pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseMove = function(pos, button) {
    deltaX = pos.x - this.referencePos.x;
    deltaY = pos.y - this.referencePos.y;
    this.referencePos = pos
    if (button === 'right' || this.world().currentKey === 16) { // shiftClicked
        this.controls.panLeft(deltaX / this.dimensions.x / this.scale * 15);
        this.controls.panUp(deltaY / this.dimensions.y / this.scale * 10);
    } else {
        horzAngle = deltaX / (this.dimensions.x * this.scale) * 360;
        vertAngle = deltaY / (this.dimensions.y * this.scale) * 360;
        this.controls.rotateLeft(radians(horzAngle));
        this.controls.rotateUp(radians(vertAngle));
    }
    this.controls.update();
    this.reRender();
};

StageMorph.prototype.originalAdd = StageMorph.prototype.add;
StageMorph.prototype.add = function(morph) {
	this.originalAdd(morph);
	if (morph instanceof SpriteMorph) {
		this.scene.add(morph.beetle);
		this.reRender();
	}
}

StageMorph.prototype.clearPenTrails = function() {
    // We'll never need to clear the pen trails in BeetleBlocks, it only causes the renderer to disappear
	nop(); 
};
