Process.prototype.clear = function() {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	stage.scene.remove(stage.myObjects);
	stage.myObjects = new THREE.Object3D();
	stage.scene.add(stage.myObjects);

	beetle.drawing = false;
	beetle.extruding = false; 

	beetle.reset();
	beetle.resetColor();
	beetle.posAndRotStack = new Array();
	stage.reRender();
};

Process.prototype.goHome = function() {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	beetle.reset();
	if (beetle.extruding) {
		this.addPointToExtrusion();
	}
	stage.reRender();
};

Process.prototype.setPosition = function(x, y, z) {	
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}
	x = Number(x);
	y = Number(y);
	z = Number(z);
	beetle.position = new THREE.Vector3(y, z, x); 	

	if (beetle.extruding) {
		this.addPointToExtrusion();
	}

	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		this.addLineGeom(startPoint, endPoint);
	}	
	stage.reRender();
};

Process.prototype.setPositionOnAxis = function(axis, pos) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}

	pos = Number(pos);
	if (axis == 'x') {
		beetle.position.z = pos;
	}
	if (axis == 'y') {
		beetle.position.x = pos;
	}
	if (axis == 'z') {
		beetle.position.y = pos;
	}		
	if (beetle.extruding) {
		this.addPointToExtrusion();
	}
	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		this.addLineGeom(startPoint, endPoint);
	}	
	stage.reRender();
};

Process.prototype.changePositionBy = function(axis, dist) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}

	dist = Number(dist);
	if (axis == 'x') {
		beetle.position.z += dist;
	}
	if (axis == 'y') {
		beetle.position.x += dist;
	}
	if (axis == 'z') {
		beetle.position.y += dist;
	}	
	if (beetle.extruding) {
		this.addPointToExtrusion();
	}
	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		this.addLineGeom(startPoint, endPoint);
	}	

	stage.reRender();
};

Process.prototype.setRotationOnAxis = function(axis, angle) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	angle = Number(angle);
	if (axis == 'x') {
		beetle.rotation.z = radians(angle * -1);
	}
	if (axis == 'y') {
		beetle.rotation.x = radians(angle * -1);
	}
	if (axis == 'z') {
		beetle.rotation.y = radians(angle);
	}

	if (beetle.extruding) {
		this.addPointToExtrusion();
	}

	stage.reRender();
};

Process.prototype.pointTowards = function(x, y, z) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
	x = Number(x);
	y = Number(y);
	z = Number(z);
	beetle.lookAt(new THREE.Vector3(y, z, x));
	stage.reRender();
};

Process.prototype.addLineGeom = function(startPoint, endPoint) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		geometry = new THREE.Geometry();

	geometry.vertices.push(startPoint);
	geometry.vertices.push(endPoint);
	var lineMaterial = new THREE.LineBasicMaterial({ color: beetle.color });
	var line = new THREE.Line(geometry, lineMaterial);
	stage.myObjects.add(line);		
	stage.reRender();
}

Process.prototype.move = function(dist) {
	var beetle = this.homeContext.receiver.beetle;
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}
	dist = Number(dist);		
	beetle.translateZ(dist);

	if (beetle.extruding) {
		this.addPointToExtrusion();
	}
	if (beetle.drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		this.addLineGeom(startPoint, endPoint);
	}
	stage.reRender();
};

Process.prototype.rotate = function(axis, angle) {
	var beetle = this.homeContext.receiver.beetle;
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	angle = Number(angle);

	if (axis == 'x') {
		beetle.rotateZ(radians(angle) * -1);
	}
	if (axis == 'y') {
		beetle.rotateX(radians(angle) * -1);
	}
	if (axis == 'z') {
		beetle.rotateY(radians(angle));
	}	

	stage.reRender();
};


Process.prototype.cube = function(size) {
	var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	size = Number(size);
	this.addBoxGeom(size, size, size);
	stage.reRender();
};

Process.prototype.cuboid = function(length, width, height) {
	var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	length = Number(length);
	width = Number(width);
	height = Number(height);
	this.addBoxGeom(width, height, length); 
	stage.reRender();
};

Process.prototype.addBoxGeom = function(length, width, height) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		boxGeometry = new THREE.BoxGeometry(length, width, height),
		material = new THREE.MeshLambertMaterial( { color: beetle.color } );

	material.wireframe = stage.renderer.isWireframeMode;
	var box = new THREE.Mesh(boxGeometry, material);
	box.position.copy(beetle.position);
	box.rotation.copy(beetle.rotation);	

	stage.myObjects.add(box);
	stage.reRender();
}

Process.prototype.sphere = function(diam) {
	var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	diam = Number(diam);
	this.addSphereGeom(diam);
	stage.reRender();
};

Process.prototype.addSphereGeom = function(diam) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		sphereGeometry = new THREE.SphereGeometry(diam/2),
		material = new THREE.MeshLambertMaterial( { color: beetle.color } );

	material.wireframe = stage.renderer.isWireframeMode;
	var sphere = new THREE.Mesh(sphereGeometry, material);
	sphere.position.copy(beetle.position);
	sphere.rotation.copy(beetle.rotation);	
	stage.myObjects.add(sphere);
}

Process.prototype.tube = function(length, outer, inner) {
	var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	length = Number(length);
	outer = Number(outer);
	inner = Number(inner);
	this.addTubeGeom(length, outer, inner);
	stage.reRender();
};

// this needs to be cleaned up
// remove redundant code and make a function to generate the circle points
Process.prototype.addTubeGeom = function(length, outer, inner) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		pts = [],
		numPoints = 24,
		radius = outer/2;

	for (i = 0; i < numPoints; i ++) {
		var a = 2 * Math.PI * i / numPoints;
		pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
	}
	var shape = new THREE.Shape( pts );

	pts = [];
	radius = inner/2;
	for (i = 0; i < numPoints; i ++) {
		var a = 2 * Math.PI * i / numPoints;
		pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
	}
	var hole = new THREE.Shape(pts);		
	shape.holes.push(hole);

	var options = { 
		amount: length,
		bevelEnabled: false
	};

	var tubeGeom = new THREE.ExtrudeGeometry(shape, options);
	var material = new THREE.MeshLambertMaterial({ color: beetle.color });
	material.wireframe = stage.renderer.isWireframeMode;
	var tube = new THREE.Mesh(tubeGeom, material);

	tube.position.copy(beetle.position);
	tube.rotation.copy(beetle.rotation);	
	tube.translateZ(-length/2);		
	stage.myObjects.add(tube);
}

Process.prototype.text = function(textString, height, depth) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	height = Number(height);
	depth = Number(depth);

	var textGeometry = new THREE.TextGeometry(textString, {
		font: 'helvetiker',
		size: height,
		height: depth
	});

	var material = new THREE.MeshLambertMaterial({ color: beetle.color });
	material.wireframe = stage.renderer.isWireframeMode;
	var t = new THREE.Mesh(textGeometry, material);
	t.position.copy(beetle.position);
	t.rotation.copy(beetle.rotation);	
	stage.myObjects.add(t);
	stage.reRender();
};

// plan for extrusions appearing as you move:
// tubegeometry needs to have a pre-allocated size, so
// create a tubegeometry with 100 segments, and update the geometry as you go
// keep track of segments and create a new tubegeometry as needed

Process.prototype.startExtrusion = function() {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	beetle.extruding = true;
	beetle.extrusionPoints = new Array();
	this.addPointToExtrusion();
	this.addSphereGeom(beetle.extrusionRadius); // start cap
	stage.reRender();
};

Process.prototype.stopExtrusion = function() {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	if (beetle.extruding) {
		beetle.extruding = false;
		//addPointToExtrusion();

		var extrudeBend = new THREE.SplineCurve3(beetle.extrusionPoints);
		var path = new THREE.TubeGeometry(extrudeBend, beetle.extrusionPoints.length, beetle.extrusionRadius/2, 8, false);
		var material = new THREE.MeshLambertMaterial({ color: beetle.color, });
		material.wireframe = stage.renderer.isWireframeMode;
		var mesh = new THREE.Mesh(path, material);
		stage.myObjects.add(mesh);
		this.addSphereGeom(beetle.extrusionRadius); // end cap
	}
	stage.reRender();
};

Process.prototype.setExtrusionRadius = function(radius) {
	this.homeContext.receiver.beetle.extrusionRadius = radius;
}

Process.prototype.changeExtrusionRadius = function(delta) {
	this.homeContext.receiver.beetle.extrusionRadius += delta;
}

Process.prototype.addPointToExtrusion = function() {
	var beetle = this.homeContext.receiver.beetle;
	var p = new THREE.Vector3();
	beetle.extrusionPoints.push(p.copy(beetle.position));
}

Process.prototype.startDrawing = function() {
	var beetle = this.homeContext.receiver.beetle;
	beetle.drawing = true;
};

Process.prototype.stopDrawing = function() {
	var beetle = this.homeContext.receiver.beetle;
	beetle.drawing = false;
};

Process.prototype.setHSL = function(channel, value) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		value = Number(value);
	var hsl = beetle.color.getHSL();
	if (channel == 'hue') {
		value %= 360; // wrap
		value /= 360; // scale from 0-360 to 0-1
		hsl.h = value;
	} else {
		value %= 100; // wrap
		value /= 100; // scale from 0-100 to 0-1
		if (channel == 'saturation') {
			hsl.s = value;
		} else if (channel == 'lightness') {
			hsl.l = value;
		}
	}
	beetle.color.setHSL(hsl.h, hsl.s, hsl.l);
	beetle.shape.material.color = beetle.color;		
	stage.reRender();
};

Process.prototype.changeHSL = function(channel, value) {	
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph),
		value = Number(value);
	if (channel == 'hue') {
		value %= 360; // wrap
		value /= 360; // scale from 0-360 to 0-1
		beetle.color.offsetHSL(value,0,0);
	} else {
		value %= 100; // wrap
		value /= 100; // scale from 0-100 to 0-1
		if (channel == 'saturation') {
			beetle.color.offsetHSL(0,value,0);
		} else if (channel == 'lightness') {
			beetle.color.offsetHSL(0,0,value);
		}
	}
	beetle.shape.material.color = beetle.color;	
	stage.reRender();
};

Process.prototype.getHSL = function(channel) {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	if (channel == 'hue') {
		return(beetle.color.getHSL().h * 360);
	}
	if (channel == 'saturation') {
		return(beetle.color.getHSL().s * 100);
	}
	if (channel == 'lightness') {
		return(beetle.color.getHSL().l * 100);
	}
	stage.reRender();
};

Process.prototype.getPosition = function(axis) {
	var beetle = this.homeContext.receiver.beetle,
		pos = 0;

	if (axis == 'x') {
		pos = beetle.position.z;
	}
	if (axis == 'y') {
		pos = beetle.position.x;
	}
	if (axis == 'z') {
		pos = beetle.position.y;
	}
	return pos;
};

Process.prototype.getRotation = function(axis) {
	var beetle = this.homeContext.receiver.beetle,
		rot = 0;

	if (axis == 'x') {
		rot = beetle.rotation.z;
	}
	if (axis == 'y') {
		rot = beetle.rotation.x;
	}
	if (axis == 'z') {
		rot = beetle.rotation.y;
	}
	return degrees(rot);
};

Process.prototype.pushPosition = function() {
	var beetle = this.homeContext.receiver.beetle;
	beetle.posAndRotStack.push({position: beetle.position.clone(), rotation: beetle.rotation.clone()});
};

Process.prototype.popPosition = function() {
	var beetle = this.homeContext.receiver.beetle,
		stage = this.homeContext.receiver.parentThatIsA(StageMorph);

	if (beetle.posAndRotStack.length) {
		var posAndRot = beetle.posAndRotStack.pop();	
		beetle.position.set(posAndRot.position.x, posAndRot.position.y, posAndRot.position.z);
		beetle.rotation.set(posAndRot.rotation.x, posAndRot.rotation.y, posAndRot.rotation.z);
		stage.reRender();
		if (beetle.extruding) { this.addPointToExtrusion() }
	}
};

