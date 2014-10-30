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
*/
var threeLayer = document.createElement('div');
threeLayer.id = 'three';
threeLayer.style.position = 'absolute';
threeLayer.style.left = '6px';
threeLayer.style.top = '72px';
threeLayer.style.width = '480px';
threeLayer.style.height = '360px';
threeLayer.style.color = '#ffffff';
threeLayer.style.textShadow = 'none';


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
// Moved to threads.js


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
