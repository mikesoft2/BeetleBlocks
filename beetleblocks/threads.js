Process.prototype.clear = function() {
	scene.remove(myObjects);
	myObjects = new THREE.Object3D();
	scene.add(myObjects);
	
	drawing = false;
	extruding = false; 
	
	resetbeetle();
	resetbeetleColor();
	posAndRotStack = new Array();
    reRender();
};

Process.prototype.goHome = function() {
	resetbeetle();
	if (extruding) {
		addPointToExtrusion();
	}
    reRender();
};

Process.prototype.resetCamera = function() {
	resetCamera();
    reRender();
};

Process.prototype.setPosition = function(x, y, z) {	
	if (drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}
	x = Number(x);
	y = Number(y);
	z = Number(z);
	beetle.position = new THREE.Vector3(y, z, x); 	
		
	if (extruding) {
		addPointToExtrusion();
	}

	if (drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		addLineGeom(startPoint, endPoint);
	}	
    reRender();
};

Process.prototype.setPositionOnAxis = function(axis, pos) {

	if (drawing) {
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
	if (extruding) {
		addPointToExtrusion();
	}
	if (drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		addLineGeom(startPoint, endPoint);
	}	
    reRender();
};

Process.prototype.changePositionBy = function(axis, dist) {

	if (drawing) {
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
	if (extruding) {
		addPointToExtrusion();
	}
	if (drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		addLineGeom(startPoint, endPoint);
	}	
	
    reRender();
};

Process.prototype.setRotationOnAxis = function(axis, angle) {
	angle = Number(angle);
	if (axis == 'x') {
		beetle.rotation.z = toRad(angle * -1);
	}
	if (axis == 'y') {
		beetle.rotation.x = toRad(angle * -1);
	}
	if (axis == 'z') {
		beetle.rotation.y = toRad(angle);
	}
	
	if (extruding) {
		addPointToExtrusion();
	}
    reRender();
};

Process.prototype.pointTowards = function(x, y, z) {
	x = Number(x);
	y = Number(y);
	z = Number(z);
	beetle.lookAt(new THREE.Vector3(y, z, x));
};

function addLineGeom(startPoint, endPoint) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(startPoint);
	geometry.vertices.push(endPoint);
	var lineMaterial = new THREE.LineBasicMaterial({
		color: beetleColor
	});
	var line = new THREE.Line(geometry, lineMaterial);
	myObjects.add(line);		
    reRender();
}

Process.prototype.move = function(dist) {
	if (drawing) {
		var p = new THREE.Vector3();
		var startPoint =  p.copy(beetle.position);
	}
	dist = Number(dist);		
	beetle.translateZ(dist);
	
	if (extruding) {
		addPointToExtrusion();
	}
	if (drawing) {
		var p = new THREE.Vector3();
		var endPoint = p.copy(beetle.position);
		addLineGeom(startPoint, endPoint);
	}
    reRender();
};

Process.prototype.rotate = function(axis, angle) {
	angle = Number(angle);
	if (axis == 'x') {
		beetle.rotateZ(toRad(angle) * -1);
	}
	if (axis == 'y') {
		beetle.rotateX(toRad(angle) * -1);
	}
	if (axis == 'z') {
		beetle.rotateY(toRad(angle));
	}	
    reRender();
};


Process.prototype.cube = function(size) {
	size = Number(size);
	addBoxGeom(size, size, size);
    reRender();
};

Process.prototype.cuboid = function(length, width, height) {
	length = Number(length);
	width = Number(width);
	height = Number(height);
	addBoxGeom(width, height, length); 
    reRender();
};

function addBoxGeom(length, width, height) {
	var boxGeometry = new THREE.BoxGeometry(length, width, height);
	var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
	var box = new THREE.Mesh(boxGeometry, material);
	box.position.copy(beetle.position);
	box.rotation.copy(beetle.rotation);	
	myObjects.add(box);
    reRender();
}

Process.prototype.sphere = function(diam) {
	diam = Number(diam);
	addSphereGeom(diam);
    reRender();
};

function addSphereGeom(diam) {
	var sphereGeometry = new THREE.SphereGeometry(diam/2);
	var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
	var sphere = new THREE.Mesh(sphereGeometry, material);
	sphere.position.copy(beetle.position);
	sphere.rotation.copy(beetle.rotation);	
	myObjects.add(sphere);
}

Process.prototype.tube = function(length, outer, inner) {
	length = Number(length);
	outer = Number(outer);
	inner = Number(inner);
	addTubeGeom(length, outer, inner);
    reRender();
};

// this needs to be cleaned up
// remove redundant code and make a function to generate the circle points
function addTubeGeom(length, outer, inner) {
	var pts = [];
	var numPoints = 24;
	
	var radius = outer/2;
	for ( i = 0; i < numPoints; i ++ ) {
		var a = 2 * Math.PI * i / numPoints;
		pts.push( new THREE.Vector2 ( Math.cos( a ) * radius, Math.sin( a ) * radius ) );
	}
	var shape = new THREE.Shape( pts );
	
	pts = [];
	radius = inner/2;
	for ( i = 0; i < numPoints; i ++ ) {
		var a = 2 * Math.PI * i / numPoints;
		pts.push( new THREE.Vector2 ( Math.cos( a ) * radius, Math.sin( a ) * radius ) );
	}
	var hole = new THREE.Shape(pts);		
	shape.holes.push(hole);

	var options = { 
		amount: length,
		bevelEnabled: false
	};

	var tubeGeom = new THREE.ExtrudeGeometry( shape, options );
	var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
	var tube = new THREE.Mesh(tubeGeom, material);
	
	tube.position.copy(beetle.position);
	tube.rotation.copy(beetle.rotation);	
	tube.translateZ(-length/2);		
	myObjects.add(tube);
}

Process.prototype.text = function(textString, height, depth) {
	height = Number(height);
	depth = Number(depth);
	var textGeometry = new THREE.TextGeometry(textString, {
		font: 'helvetiker',
		size: height,
		height: depth
			
	});
	var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
	var t = new THREE.Mesh(textGeometry, material);
	t.position.copy(beetle.position);
	t.rotation.copy(beetle.rotation);	
	myObjects.add(t);
    reRender();
};

// plan for extrusions appearing as you move:
// tubegeometry needs to have a pre-allocated size, so
// create a tubegeometry with 100 segments, and update the geometry as you go
// keep track of segments and create a new tubegeometry as needed

Process.prototype.startExtrusion = function() {
	extruding = true;
	extrusionPoints = new Array();
	addPointToExtrusion();
	addSphereGeom(1); // start cap
    reRender();
};

Process.prototype.stopExtrusion = function() {
	if (extruding) {
		extruding = false;
		//addPointToExtrusion();
	
		var extrudeBend = new THREE.SplineCurve3(extrusionPoints);
		var path = new THREE.TubeGeometry(extrudeBend, extrusionPoints.length, 0.5, 8, false);
		var mesh = new THREE.Mesh( path, new THREE.MeshLambertMaterial( { 
			color: beetleColor, 
			} ) );
		myObjects.add(mesh);
		addSphereGeom(1); // end cap
	}
    reRender();
};

function addPointToExtrusion() {
	var p = new THREE.Vector3();
	extrusionPoints.push(p.copy(beetle.position));
}

Process.prototype.startDrawing = function() {
	drawing = true;
};

Process.prototype.stopDrawing = function() {
	drawing = false;
};

Process.prototype.setHSL = function(channel, value) {
	value = Number(value);
	value %= 100; // wrap
	value /= 100; // scale from 0-100 to 0-1
	
	var hsl = beetleColor.getHSL();
	if (channel == 'hue') {
		hsl.h = value;
	}
	if (channel == 'saturation') {
		hsl.s = value;
	}
	if (channel == 'lightness') {
		hsl.l = value;
	}
	beetleColor.setHSL(hsl.h, hsl.s, hsl.l);
	beetle.beetleShape.material.color = beetleColor;		
    reRender();
};

Process.prototype.changeHSL = function(channel, value) {	
	value = Number(value);
	value %= 100; // wrap
	value /= 100; // scale from 0-100 to 0-1
	if (channel == 'hue') {
		beetleColor.offsetHSL(value,0,0);
	}
	if (channel == 'saturation') {
		beetleColor.offsetHSL(0,value,0);
	}
	if (channel == 'lightness') {
		beetleColor.offsetHSL(0,0,value);
	}
	beetle.beetleShape.material.color = beetleColor;		
    reRender();
};

Process.prototype.getHSL = function(channel) {
	if (channel == 'hue') {
		return(beetleColor.getHSL().h * 100);
	}
	if (channel == 'saturation') {
		return(beetleColor.getHSL().s * 100);
	}
	if (channel == 'lightness') {
		return(beetleColor.getHSL().l * 100);
	}
    reRender();
};

Process.prototype.getPosition = function(axis) {
	var pos = 0;
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
	var rot = 0;
	if (axis == 'x') {
		rot = beetle.rotation.z;
	}
	if (axis == 'y') {
		rot = beetle.rotation.x;
	}
	if (axis == 'z') {
		rot = beetle.rotation.y;
	}
	return toDeg(rot);
};

Process.prototype.pushPosition = function() {
	posAndRotStack.push(new posAndRot(beetle.position.clone(), beetle.rotation.clone()));
};

Process.prototype.popPosition = function() {
	if (posAndRotStack.length > 0) {
		var posAndRot = posAndRotStack.pop();	
		beetle.position.set(posAndRot.position.x, posAndRot.position.y, posAndRot.position.z);
		beetle.rotation.set(posAndRot.rotation.x,posAndRot.rotation.y,posAndRot.rotation.z);
		
		if (extruding) {
			addPointToExtrusion();
		}
	}
};

