/*
Beetleblocks

A 3D world for moving a "beetle" in 3D space using Snap blocks,
positioning 3D shapes and tracing extrusions, and exporting
the resulting geometry from 3D printing

*/

/*
Coordinate system remapping

Note that the "internal" axis names used by three.js functions
are different from the "external" axis names used by beetleblocks
functions and their corresponding block labels. The "forward" axis
is the direction along which the beetle moves forward

red  	internal Z	beetleblocks X	(forward)
green	internal X	beetleblocks Y
blue	internal Y 	beetleblocks Z

also note that rotations around X and Z are inverted
*/

// setup THREE.js
var scene = new THREE.Scene();
	
// setup renderer
var renderer = new THREE.WebGLRenderer();
var stageWidth = 480; 
var stageHeight = 360;
renderer.setSize(stageWidth, stageHeight);
renderer.setClearColor( 0xCCCCCC, 1);

/*

we need to put the renderer.domElement somewhere in the DOM
in order to display it- below is the strategy from the scratch extension

// make a layer for the 3D window that sits on top of the scratch stage
var threeLayer = document.createElement('div');
threeLayer.id = 'three';
threeLayer.style.position = 'absolute';
threeLayer.style.left = '6px';
threeLayer.style.top = '72px';
threeLayer.style.width = '480px';
threeLayer.style.height = '360px';
threeLayer.style.color = '#ffffff';
threeLayer.style.textShadow = 'none';
document.body.appendChild(threeLayer);
threeLayer.appendChild(renderer.domElement);
*/


// download the STL file containing all the geometry in the scene (not incl. the beetle)
// this function should probably be called from a menu item
function downloadSTL () {
	var exporter = new THREE.STLExporter();
	var stlString = exporter.exportScene(scene);
	var blob = new Blob([stlString], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "myObjects.stl"); // better to generate a unique filename
								   // and/or use snap project filename
};

/*
OBJ export not working yet... this is a research topic 

the problem with OBJ export is that it uses geometry data, not meshes
the geometries are not offset relative to each other- all are at the origin
maybe it's possible to manually offset them here?
also the current OBJExporter does not handle colors
do we also need to generate an mtl file to represent the different colors?

OBJButton.onclick = function () {
	var exporter = new THREE.OBJExporter();
	
	var numObjects = myObjects.length;
	console.log('exporting ' + numObjects + ' objects');

	var objString = '';	
	for (int i=0; i<numObjects; i++) {
		var geom = myObjects.children[i].geometry; 
		objString += exporter.parse(geom);
	}		
	
	var blob = new Blob([objString], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "myObjects.obj"); // maybe at least add a datetime string for unique filenames?
};
*/
 
// setup camera
var camera, controls;
resetCamera();

// create the beetle
var beetle = new THREE.Object3D();
var beetleColor = new THREE.Color();
var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
var beetleGeometry = new THREE.CylinderGeometry( 0, 0.25, 0.7, 32);
var beetleShape = new THREE.Mesh(beetleGeometry, material);
beetleShape.rotation.x = toRad(90);
beetleShape.position.z = 0.35;
beetleShape.name = "beetleShape";
beetle.add(beetleShape);
scene.add(beetle);
resetbeetle();
resetbeetleColor();

function addLineToPointWithColorToObject(point, color, object) {
	geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3());
	geometry.vertices.push(point);
	var lineMaterial = new THREE.LineBasicMaterial({
		color: color
	});
	var line = new THREE.Line(geometry, lineMaterial);
	object.add(line);		
}

// beetle's local axis lines
p = new THREE.Vector3(1,0,0);
addLineToPointWithColorToObject(p, 0x00FF00, beetle);
p = new THREE.Vector3(0,1,0);
addLineToPointWithColorToObject(p, 0x0000FF, beetle);
p = new THREE.Vector3(0,0,1);
addLineToPointWithColorToObject(p, 0xFF0000, beetle);

// global axis lines
p = new THREE.Vector3(5,0,0);
addLineToPointWithColorToObject(p, 0x00FF00, scene);
p = new THREE.Vector3(0,5,0);
addLineToPointWithColorToObject(p, 0x0000FF, scene);
p = new THREE.Vector3(0,0,5);
addLineToPointWithColorToObject(p, 0xFF0000, scene);

// the user's creation gets added to myObjects (so we can easily clear, export, etc)
var myObjects = new THREE.Object3D();
scene.add(myObjects);

// a stack to push and pop position and rotation states
// this stores an array of posAndRot objects
var posAndRotStack = new Array();
function posAndRot(position, rotation) {
	this.position = position;
	this.rotation = rotation;
}

// extrusion
var extruding = false;
var currentExtrusion; 

// drawing
var drawing = false;

// lights
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 1, 1, 0 );
scene.add( directionalLight );

var pointLight = new THREE.PointLight( 0xffffff, 1, 200 );
pointLight.position.set( 10, 10, 10 );
scene.add( pointLight );

// renderer
var render = function () {
	pointLight.position.copy(camera.position); // pointlight moves with the camera
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};
render();

// UTILITY FUNCTIONS

function toRad(Value) {
	return Value * Math.PI / 180;
}	
function toDeg(Value) {
   return Value * 180 / Math.PI;
}

function resetCamera() {
	camera = new THREE.PerspectiveCamera( 60, 480/360, 1, 1000 );
	camera.position.x = -5;
	camera.position.y = 7;
	camera.position.z = 5;
	camera.lookAt(new THREE.Vector3());
	controls = new THREE.OrbitControls( camera, threeLayer );
	controls.addEventListener( 'change', render );
	scene.add(camera);
}

function resetbeetle() {	
	beetle.position.set(0,0,0);
	beetle.rotation.set(0,0,0);

}
function resetbeetleColor() {	
	beetleColor.setHSL(0.05,0.5,0.5);
	beetle.getObjectByName("beetleShape").material.color = beetleColor;	
}

// BLOCKS

Process.prototype.clear = function() {
	scene.remove(myObjects);
	myObjects = new THREE.Object3D();
	scene.add(myObjects);
	
	drawing = false;
	extruding = false; 
	
	resetbeetle();
	resetbeetleColor();
	posAndRotStack = new Array();
};

Process.prototype.goHome = function() {

	resetbeetle();
	if (extruding) {
		addPointToExtrusion();
	}
};

Process.prototype.resetCamera = function() {
	resetCamera();
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
};


Process.prototype.cube = function(size) {
	size = Number(size);
	addBoxGeom(size, size, size);
};

Process.prototype.cuboid = function(length, width, height) {
	length = Number(length);
	width = Number(width);
	height = Number(height);
	addBoxGeom(width, height, length); 
};

function addBoxGeom(length, width, height) {
	var boxGeometry = new THREE.BoxGeometry(length, width, height);
	var material = new THREE.MeshLambertMaterial( { color: beetleColor } );
	var box = new THREE.Mesh(boxGeometry, material);
	box.position.copy(beetle.position);
	box.rotation.copy(beetle.rotation);	
	myObjects.add(box);
}

Process.prototype.sphere = function(diam) {
	diam = Number(diam);
	addSphereGeom(diam);
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

/*

camera control functions - not working correctly

Process.prototype.cameraPan = function(direction, dist) {
	dist = Number(dist);
	if (direction == 'up') {
		controls.pan(0, dist);
	}
	if (direction == 'right') {
		controls.pan(-1 * dist, 0);
	}
	controls.update();
};

Process.prototype.lookAt = function(target) {
	if (target == "beetle") {
		controls.target = beetle.position.clone();
	} 
	if (target == "origin") {
		controls.target = new THREE.Vector3();
	}
	controls.update();
};
*/

var descriptor = {
	blocks: [
		[' ', 'clear',							'clear'],
		[' ', 'go home',						'goHome'],
		
		[' ', 'move %n',						'move', 1],
		[' ', 'rotate %m.axes by %n',			'rotate', 'z', 15],
		
		[' ', 'go to x:%n y:%n z:%n',			'setPosition', 0, 0, 0],		
		[' ', 'set %m.axes to %n',				'setPositionOnAxis', 'x', 0],
		[' ', 'change %m.axes by %n',			'changePositionBy', 'x', 1],
		[' ', 'set %m.axes rotation to %n',		'setRotationOnAxis', 'z', 0],
		[' ', 'point towards x:%n y:%n z:%n',	'pointTowards', 0, 0, 0], 			
		['r', '%m.axes position',				'getPosition', 'x'],
		['r', '%m.axes rotation',				'getRotation', 'z'],
		[' ', 'push position', 					'pushPosition'],
		[' ', 'pop position', 					'popPosition'],
		
		[' ', 'cube size %n',					'cube', 0.5],
		[' ', 'cuboid l:%n w:%n h:%n',			'cuboid', 1, 0.5, 0.3], 		
		[' ', 'sphere diameter %n',				'sphere', 0.5], 			
		[' ', 'tube l: %n outer: %n inner: %n',	'tube', 2, 1, 0.5], 			
		[' ', 'text %s height %n depth %n',		'text', 'hello world', 1, 0.5],
		[' ', 'start drawing',					'startDrawing'],			
		[' ', 'stop drawing',					'stopDrawing'],				
		[' ', 'start extruding',				'startExtrusion'],
		[' ', 'stop extruding',					'stopExtrusion'],
		
		[' ', 'set %m.hsl to %n',				'setHSL', 'hue', 50],
		[' ', 'change %m.hsl by %n',			'changeHSL', 'hue', 10],
		['r', 'color %m.hsl',					'getHSL', 'hue'],
		
		//[' ', 'camera pan %m.directions %n',	'cameraPan', 'right', 10],
		//[' ', 'camera look at %m.lookat',		'lookAt', 'beetle'],
		//[' ', 'camera look at x%n y%n z%n',		'lookAtCoord', 0, 0, 0],		
		//[' ', 'reset camera',					'resetCamera'],
		
		],     
	menus: {
		axes: ['x', 'y', 'z'],
		directions: ['right', 'up'],
		hsl: ['hue', 'saturation', 'lightness'],
		lookat: ['beetle', 'origin']
	},
	url: ''
};