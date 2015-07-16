Process.prototype.clear = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    this.stopDrawing();
    this.stopExtrusion();
    beetle.extrusionDiameter = 1;

    stage.scene.remove(stage.myObjects);
    stage.myObjects = new THREE.Object3D();
    stage.scene.add(stage.myObjects);

    beetle.multiplierScale = 1;

    beetle.reset();
    beetle.color.reset();
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

Process.prototype.setScale = function(scale) {
    var sprite = this.homeContext.receiver,
        beetle = sprite.beetle,
        ide = sprite.parentThatIsA(IDE_Morph);

    beetle.multiplierScale = Math.max(0, Number(scale));
    ide.statusDisplay.refresh();
}

Process.prototype.changeScale = function(delta) {
    var sprite = this.homeContext.receiver,
        beetle = sprite.beetle,
        ide = sprite.parentThatIsA(IDE_Morph);

    beetle.multiplierScale += Number(delta);

    if (beetle.multiplierScale < 0) { beetle.multiplierScale = 0 };

    ide.statusDisplay.refresh();
}

Process.prototype.reportScale = function() {
    var beetle = this.homeContext.receiver.beetle;
    return beetle.multiplierScale;
}

Process.prototype.setPosition = function(x, y, z) {	
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    if (beetle.drawing) {
        var p = new THREE.Vector3();
        var startPoint = p.copy(beetle.position);
    }

    x = Number(x);
    y = Number(y);
    z = Number(z);

    beetle.position.set(y, z, x); 

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
        beetle.position.setZ(pos);
    }
    if (axis == 'y') {
        beetle.position.setX(pos);
    }
    if (axis == 'z') {
        beetle.position.setY(pos);
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

    dist = Number(dist) * beetle.multiplierScale;
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
    // We're losing precision here
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

    var lineMaterial = new THREE.LineBasicMaterial({ color: beetle.color }),
        line = new THREE.Line(geometry, lineMaterial);

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

    dist = Number(dist) * beetle.multiplierScale;
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
    var beetle = this.homeContext.receiver.beetle;
    stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    size = Number(size) * beetle.multiplierScale;
    
    this.addBoxGeom(size, size, size);

    stage.reRender();
};

Process.prototype.cuboid = function(length, width, height) {
    var beetle = this.homeContext.receiver.beetle;
    stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    length = Number(length) * beetle.multiplierScale;
    width = Number(width) * beetle.multiplierScale;
    height = Number(height) * beetle.multiplierScale;
    this.addBoxGeom(width, height, length); 

    stage.reRender();
};

Process.prototype.addBoxGeom = function(length, width, height) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        boxGeometry = new THREE.BoxGeometry(Math.abs(length), Math.abs(width), Math.abs(height));

    var box = new THREE.Mesh(boxGeometry, beetle.newLambertMaterial());
    box.position.copy(beetle.position);
    box.rotation.copy(beetle.rotation);	

    // If any of the sides is negative, we carve a negative cuboid
    stage.myObjects.add(box, (length < 0 || width < 0 || height < 0));
    stage.reRender();
}

Process.prototype.sphere = function(diam) {
    var beetle = this.homeContext.receiver.beetle;
    stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    diam = Number(diam) * beetle.multiplierScale;
    this.addSphereGeom(diam);
};

Process.prototype.addSphereGeom = function(diam, isExtrusionCap) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        sphereGeometry = new THREE.SphereGeometry(
                Math.abs(diam/2), 
                isExtrusionCap ?  12: 16,
                isExtrusionCap ?  6: 12);

    var sphere = new THREE.Mesh(sphereGeometry, beetle.newLambertMaterial());
    sphere.position.copy(beetle.position);
    sphere.rotation.copy(beetle.rotation);
    
    // If the diameter is negative, we carve a negative sphere
    stage.myObjects.add(sphere, diam < 0);
    stage.reRender();

    return sphere;
}

Process.prototype.tube = function(length, outer, inner) {
    var beetle = this.homeContext.receiver.beetle;
    stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    length = Number(length) * beetle.multiplierScale;
    outer = Number(outer) * beetle.multiplierScale;
    inner = Number(inner) * beetle.multiplierScale;
    this.addTubeGeom(length, outer, inner);

    stage.reRender();
};

Process.prototype.addTubeGeom = function(length, outer, inner) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        outerRadius = outer/2, 
        innerRadius = inner/2;

    var arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, 0, false);

    var holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    var tubeGeom = new THREE.ExtrudeGeometry(
            arcShape, 
            { 
                amount: length, 
                steps: 1, 
                bevelEnabled: true, 
                bevelThickness: 0, 
                bevelSize: 0 
            });

    tubeGeom.computeFaceNormals();
    tubeGeom.computeVertexNormals();

    var tube = new THREE.Mesh(tubeGeom, beetle.newLambertMaterial());
    tube.position.copy(beetle.position);
    tube.rotation.copy(beetle.rotation);	
    tube.translateZ(-length/2);		

    stage.myObjects.add(tube);
}

Process.prototype.text = function(textString, height, depth) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph), 
        height = Number(height) * beetle.multiplierScale,
        depth = Number(depth) * beetle.multiplierScale,
        textGeometry = new THREE.TextGeometry(textString, { font: 'helvetiker', size: height, height: depth });

    var mesh = new THREE.Mesh(textGeometry, beetle.newLambertMaterial());

    mesh.position.copy(beetle.position);
    mesh.rotation.copy(beetle.rotation);	
    THREE.GeometryUtils.center(mesh.geometry);
    mesh.rotateY(-Math.PI/2);
    stage.myObjects.add(mesh);

    stage.reRender();
};

Process.prototype.text2D = function(textString, size) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        scaledSize = Number(size) * beetle.multiplierScale,
        fontShapes = THREE.FontUtils.generateShapes(textString, { size: scaledSize }),
        geometry = new THREE.ShapeGeometry(fontShapes, { curveSegments: 20 });

    var mesh = new THREE.Mesh(geometry, beetle.newLambertMaterial());

    mesh.position.copy(beetle.position);
    mesh.rotation.copy(beetle.rotation);	
    THREE.GeometryUtils.center(mesh.geometry);
    mesh.rotateY(-Math.PI/2);
    stage.myObjects.add(mesh);

    stage.reRender();
};

Process.prototype.startExtrusion = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        p = new THREE.Vector3();

    if (beetle.extruding) { return }

    beetle.extruding = true;
    beetle.firstExtrusion = true;
    beetle.lastExtrusionPoint = p.copy(beetle.position);

    this.addPointToExtrusion();

    beetle.startSphere = this.addSphereGeom(beetle.extrusionDiameter * beetle.multiplierScale, true);
};

Process.prototype.stopExtrusion = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    if (beetle.extruding) {
        beetle.extruding = false;
        beetle.firstExtrusion = false;
        beetle.lastExtrusionPoint = null;
        beetle.endSphere = null;
        beetle.startSphere = null;
        beetle.endCap = null;
        beetle.jointCap = null;
    }

    stage.reRender();
};

Process.prototype.addPointToExtrusion = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        p = new THREE.Vector3(),
        q = new THREE.Vector3(),
        distanceToLast = beetle.lastExtrusionPoint.distanceTo(beetle.position),
        circleGeometry = new THREE.CircleGeometry(beetle.extrusionDiameter / 2 * beetle.multiplierScale, 12),
        circleGeometry2 = new THREE.CircleGeometry(beetle.extrusionDiameter / 2 * beetle.multiplierScale, 12);

    if (beetle.endSphere) {
        stage.myObjects.remove(beetle.endSphere);
    }

    // Each time we move we create a circle at the previous position that matches the beetle's current rotation.
    // Then, we stitch the vertices of these two circles that share position, and we only add the stitched faces
    // to the scene, as we don't actually need the two circular caps.

    beetle.endSphere = this.addSphereGeom(beetle.extrusionDiameter * beetle.multiplierScale, true);

    if (beetle.endCap) {
        beetle.jointCap = new THREE.Mesh(circleGeometry, beetle.newLambertMaterial());
        beetle.jointCap.material.color = new THREE.Color();
        beetle.jointCap.position.copy(beetle.lastExtrusionPoint);
        beetle.jointCap.lookAt(beetle.position);
        beetle.jointCap.updateMatrix();
        beetle.jointCap.geometry.applyMatrix(beetle.jointCap.matrix);
        beetle.jointCap.position.set(0,0,0);
        beetle.jointCap.rotation.set(0,0,0);
        beetle.jointCap.updateMatrix(); 

        var geometry = new THREE.CylinderGeometry(
            (beetle.extrusionDiameter / 2) * beetle.multiplierScale, //radiusTop
            (beetle.extrusionDiameter / 2) * beetle.multiplierScale, //radiusBottom
            distanceToLast, //height
            12, // radiusSegments
            1, // heightSegments
            true // openEnded to save faces
            ),
        cylinder = new THREE.Mesh(geometry, beetle.newLambertMaterial());

        cylinder.position.copy(beetle.position);
        cylinder.lookAt(beetle.lastExtrusionPoint);
        cylinder.rotateX(Math.PI/2);
        cylinder.translateY(distanceToLast/2);

        stage.myObjects.add(cylinder);
    } 

    if (beetle.jointCap && !beetle.firstExtrusion) {
        // stitch botch circles together
        var jointGeometry = new THREE.Geometry();

        for (i = 0; i < circleGeometry.vertices.length; i ++) {
            jointGeometry.vertices.push(beetle.jointCap.geometry.vertices[i]);
            jointGeometry.vertices.push(beetle.endCap.geometry.vertices[i]);

            if (i > 0) {
                jointGeometry.faces.push(new THREE.Face3(i * 2, i * 2 - 1, i * 2 + 1));
                jointGeometry.faces.push(new THREE.Face3(i * 2, i * 2 - 2, i * 2 - 1));
            }
        }

        jointGeometry.mergeVertices();
        jointGeometry.computeFaceNormals();
        jointGeometry.computeVertexNormals();

        beetle.joint = new THREE.Mesh(jointGeometry, beetle.newLambertMaterial());
        stage.myObjects.add(beetle.joint);
    } 

    if (beetle.firstExtrusion && beetle.startSphere) {
        beetle.startSphere.lookAt(beetle.position);
        beetle.firstExtrusion = false;
    }

    beetle.endCap = new THREE.Mesh(circleGeometry2, beetle.newLambertMaterial());
    beetle.endCap.position.copy(beetle.position);
    if (cylinder) { 
        beetle.endCap.rotation.copy(cylinder.rotation);
        beetle.endCap.rotateX(-Math.PI/2);
        beetle.endCap.rotateY(Math.PI);
    };
    beetle.endCap.updateMatrix();
    beetle.endCap.geometry.applyMatrix(beetle.endCap.matrix);
    beetle.endCap.position.set(0,0,0);
    beetle.endCap.rotation.set(0,0,0);
    beetle.endCap.updateMatrix();

    beetle.lastExtrusionPoint = p.copy(beetle.position);

    stage.reRender();
}

Process.prototype.setExtrusionDiameter = function(diameter) {
    var beetle = this.homeContext.receiver.beetle;
    if (!beetle.extruding) {
        this.homeContext.receiver.beetle.extrusionDiameter = diameter;
    }
    // should we fire an error otherwise?
}

Process.prototype.changeExtrusionDiameter = function(delta) {
    var beetle = this.homeContext.receiver.beetle;
    if (!beetle.extruding) {
        this.homeContext.receiver.beetle.extrusionDiameter += delta;
    }
    // should we fire an error otherwise?
}

Process.prototype.startDrawing = function() {
    var beetle = this.homeContext.receiver.beetle;
    beetle.drawing = true;
};

Process.prototype.stopDrawing = function() {
    var beetle = this.homeContext.receiver.beetle;
    beetle.drawing = false;
};

// Negative Geometry
Process.prototype.startNegativeGeometry = function() {
    var beetle = this.homeContext.receiver.beetle;
    beetle.negative = true;
}

Process.prototype.stopNegativeGeometry = function() {
    var beetle = this.homeContext.receiver.beetle;
    beetle.negative = false;
}

Process.prototype.setHSLA = function(channel, value) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        value = Number(value),
        hsl = beetle.color.getHSL();

    // Hue is cyclic, while saturation, lightness and opacity are clipped between 0 and 100

    if (channel == 'hue') {
        beetle.color.state.h = Math.abs(value + 360) % 360;
    } else if (channel == 'saturation') {
        beetle.color.state.s = Math.max(Math.min(value, 100), 0);
    } else if (channel == 'lightness') {
        beetle.color.state.l = Math.max(Math.min(value, 100), 0);
    } else if (channel == 'opacity') {
        beetle.shape.material.opacity = Math.max(Math.min(value / 100, 1), 0);
    }

    beetle.color.update();
    stage.reRender();
};

Process.prototype.changeHSLA = function(channel, value) {	
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        value = Number(value);

    // Hue is cyclic, while saturation, lightness and opacity are clipped between 0 and 100

    if (channel == 'hue') {
        beetle.color.state.h = Math.abs(beetle.color.state.h + value + 360) % 360;
    } else if (channel == 'saturation') {
        beetle.color.state.s = Math.max(Math.min((beetle.color.state.s + value), 100), 0);
    } else if (channel == 'lightness') {
        beetle.color.state.l = Math.max(Math.min((beetle.color.state.l + value), 100), 0);
    } else if (channel == 'opacity') {
        beetle.shape.material.opacity = Math.max(Math.min(beetle.shape.material.opacity + value / 100, 1), 0);
    }

    beetle.color.update();
    stage.reRender();
};

Process.prototype.getHSLA = function(channel) {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    if (channel == 'hue') {
        return(beetle.color.state.h);
    }
    if (channel == 'saturation') {
        return(beetle.color.state.s);
    }
    if (channel == 'lightness') {
        return(beetle.color.state.l);
    }
    if (channel == 'opacity') {
        return(beetle.shape.material.opacity * 100);
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

        if (beetle.extruding) { this.addPointToExtrusion() }

        stage.reRender();
    }
};

Process.prototype.doAsk = function (data) {
    var stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        isStage = true,
        activePrompter;

    if (!this.prompter) {
        activePrompter = detect(
                stage.children,
                function (morph) {return morph instanceof StagePrompterMorph; }
                );
        if (!activePrompter) {
            if (!isStage) {
                this.blockReceiver().bubble(data, false, true);
            }
            this.prompter = new StagePrompterMorph(isStage ? data : null);
            if (stage.scale < 1) {
                this.prompter.setWidth(stage.width() - 10);
            } else {
                this.prompter.setWidth(stage.dimensions.x - 20);
            }
            this.prompter.fixLayout();
            this.prompter.setCenter(stage.center());
            this.prompter.setBottom(stage.bottom() - this.prompter.border);
            stage.add(this.prompter);
            this.prompter.inputField.edit();
            stage.changed();
        }
    } else {
        if (this.prompter.isDone) {
            stage.lastAnswer = this.prompter.inputField.getValue();
            this.prompter.destroy();
            this.prompter = null;
            if (!isStage) {this.blockReceiver().stopTalking(); }
            return null;
        }
    }
    this.pushContext('doYield');
    this.pushContext();
};

