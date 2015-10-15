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

    beetle.applyCostume();
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
        beetle.applyCostume();
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
        beetle.applyCostume();
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
        lineMaterial = new THREE.LineBasicMaterial({ color: beetle.color });

 if (beetle.drawStyle == 'splines') {

        // If this is the first segment, let's create an object and add the first point
        if (beetle.spline == null) {
            beetle.spline = {};
            beetle.spline.points = [startPoint];
        }

        beetle.spline.points.push(endPoint);
        beetle.spline.curve = new THREE.CatmullRomCurve3(beetle.spline.points);

        beetle.spline.geometry = new THREE.Geometry();
        beetle.spline.geometry.vertices = beetle.spline.curve.getPoints(beetle.spline.curve.points.length * 12);

        stage.myObjects.remove(beetle.spline.line);
        beetle.spline.line = new THREE.Line(beetle.spline.geometry, lineMaterial);
        beetle.spline.line.anchorPoints = beetle.spline.curve.points;
        beetle.spline.line.type = 'spline';
        stage.myObjects.add(beetle.spline.line);
        
    } else {
        
        // We don't care if there is no option selected, we start drawing lines by default
        // If this is the first segment, let's create an object and add the first point
        if (beetle.polyline == null) {
            beetle.polyline = {};
            beetle.polyline.points = [startPoint];
        }

        beetle.polyline.points.push(endPoint);

        beetle.polyline.geometry = new THREE.Geometry();
        beetle.polyline.geometry.vertices = beetle.polyline.points;
        beetle.polyline.geometry.verticesNeedUpdate = true;

        stage.myObjects.remove(beetle.polyline.line);
        beetle.polyline.line = new THREE.Line(beetle.polyline.geometry, lineMaterial);
        beetle.polyline.line.type = 'polyline';
        stage.myObjects.add(beetle.polyline.line);

    }

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
    beetle.applyCostume();

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
    beetle.extrusionPoints = [];

    this.addPointToExtrusion();

    beetle.startSphere = this.addSphereGeom(beetle.extrusionDiameter * beetle.multiplierScale, true);

};

Process.prototype.stopExtrusion = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);

    if (beetle.extruding) {
        beetle.extruding = false;
        beetle.extrusionPoints = [];
        beetle.extrusion = null;
        beetle.endSphere = null;
        beetle.startSphere = null;
    }

    stage.reRender();
};

Process.prototype.addPointToExtrusion = function() {
    var beetle = this.homeContext.receiver.beetle,
        stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        p = new THREE.Vector3();

    if (beetle.extrusion) { stage.myObjects.remove(beetle.extrusion) };

    p.copy(beetle.position);
    beetle.extrusionPoints.push(p);

    if (beetle.extrusionPoints.length < 2) { return };

    if (beetle.endSphere) {
        stage.myObjects.remove(beetle.endSphere);
    }

    beetle.endSphere = this.addSphereGeom(beetle.extrusionDiameter * beetle.multiplierScale, true);

    var extrudeBend = new THREE.CatmullRomCurve3(beetle.extrusionPoints);
    
    extrudeBend.type = 'catmullrom';
    extrudeBend.tension = 0.0000001;

    var segments = Math.max(Math.floor((extrudeBend.getLength()) * 2), 12),
        path = new THREE.TubeGeometry(extrudeBend, segments, (beetle.extrusionDiameter / 2) * beetle.multiplierScale, 12, false);

    beetle.extrusion = new THREE.Mesh(path, beetle.newLambertMaterial());

    stage.myObjects.add(beetle.extrusion);
    stage.reRender();
}

Process.prototype.setExtrusionDiameter = function(diameter) {
    var beetle = this.homeContext.receiver.beetle;
    if (!beetle.extruding) {
        this.homeContext.receiver.beetle.extrusionDiameter = diameter;
    }
}

Process.prototype.changeExtrusionDiameter = function(delta) {
    var beetle = this.homeContext.receiver.beetle;
    if (!beetle.extruding) {
        this.homeContext.receiver.beetle.extrusionDiameter += delta;
    }
}

Process.prototype.startDrawing = function(drawStyle) {
    var beetle = this.homeContext.receiver.beetle;

    if (!beetle.drawing) {
        beetle.drawing = true;
        beetle.drawStyle = drawStyle;
    } else if (beetle.drawStyle != drawStyle) {
        this.stopDrawing();
        this.startDrawing(drawStyle)
    }
};

Process.prototype.stopDrawing = function() {
    var beetle = this.homeContext.receiver.beetle;
    beetle.drawing = false;
    beetle.drawStyle = null;
    beetle.spline = null;
    beetle.polyline = null;
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

    if (beetle.drawing) {
        var style = beetle.drawStyle;
        this.stopDrawing();
        this.startDrawing(style);
    }

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

    if (beetle.drawing) {
        var style = beetle.drawStyle;
        this.stopDrawing();
        this.startDrawing(style);
    }

    stage.reRender();
};

Process.prototype.getHSLA = function(channel) {
    var beetle = this.homeContext.receiver.beetle;

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

    return null;
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

