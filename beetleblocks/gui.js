IDE_Morph.prototype.originalRemoveSprite = IDE_Morph.prototype.removeSprite;
IDE_Morph.prototype.removeSprite = function (sprite) {
	var stage = sprite.parentThatIsA(StageMorph);
	stage.scene.remove(sprite.beetle);
	stage.reRender();
	this.originalRemoveSprite(sprite);
}

// Overriding this function as we cannot proxy it since it doesn't return a menu, but instead creates it and pops it up

IDE_Morph.prototype.projectMenu = function () {
	var menu,
	    myself = this,
	    world = this.world(),
	    pos = this.controlBar.projectButton.bottomLeft(),
	    graphicsName = this.currentSprite instanceof SpriteMorph ?
		    'Costumes' : 'Backgrounds',
	    shiftClicked = (world.currentKey === 16);

	menu = new MenuMorph(this);
	menu.addItem('Project notes...', 'editProjectNotes');
	menu.addLine();
	menu.addItem('New', 'createNewProject');
	menu.addItem('Open...', 'openProjectsBrowser');
	menu.addItem('Save', "save");
	if (shiftClicked) {
		menu.addItem(
				'Save to disk',
				'saveProjectToDisk',
				'experimental - store this project\nin your downloads folder',
				new Color(100, 0, 0)
			    );
	}
	menu.addItem('Save As...', 'saveProjectsBrowser');
	menu.addLine();
	menu.addItem(
			'Import...',
			function () {
			var inp = document.createElement('input');
			if (myself.filePicker) {
			document.body.removeChild(myself.filePicker);
			myself.filePicker = null;
			}
			inp.type = 'file';
			inp.style.color = "transparent";
			inp.style.backgroundColor = "transparent";
			inp.style.border = "none";
			inp.style.outline = "none";
			inp.style.position = "absolute";
			inp.style.top = "0px";
			inp.style.left = "0px";
			inp.style.width = "0px";
			inp.style.height = "0px";
			inp.addEventListener(
				"change",
				function () {
				document.body.removeChild(inp);
				myself.filePicker = null;
				world.hand.processDrop(inp.files);
				},
				false
				);
			document.body.appendChild(inp);
			myself.filePicker = inp;
			inp.click();
			},
			'file menu import hint' // looks up the actual text in the translator
				);

	menu.addItem(
			shiftClicked ?
			'Export project as plain text...' : 'Export project...',
			function () {
			if (myself.projectName) {
			myself.exportProject(myself.projectName, shiftClicked);
			} else {
			myself.prompt('Export Project As...', function (name) {
				myself.exportProject(name);
				}, null, 'exportProject');
			}
			},
			'show project data as XML\nin a new browser window',
			shiftClicked ? new Color(100, 0, 0) : null
		    );

	menu.addItem(
			'Export blocks...',
			function () { myself.exportGlobalBlocks(); },
			'show global custom block definitions as XML\nin a new browser window'
		    );

	if (shiftClicked) {
		menu.addItem(
				'Export all scripts as pic...',
				function () { myself.exportScriptsPicture(); },
				'show a picture of all scripts\nand block definitions',
				new Color(100, 0, 0)
			    );
	}

	menu.addItem(
			'Export 3D model as STL',
			function() { myself.downloadSTL() },
			'download the currently rendered 3D model\ninto an STL file ready to be printed'
		    )

		menu.addLine();
	menu.addItem(
			'Import tools',
			function () {
			myself.droppedText(
				myself.getURLsbeOrRelative(
					'tools.xml'
					),
				'tools'
				);
			},
			'load the official library of\npowerful blocks'
		    );
	menu.addItem(
			'Libraries...',
			function () {
			// read a list of libraries from an external file,
			var libMenu = new MenuMorph(this, 'Import library'),
			libUrl = 'http://snap.berkeley.edu/snapsource/libraries/' +
			'LIBRARIES';

			function loadLib(name) {
			var url = 'http://snap.berkeley.edu/snapsource/libraries/'
			+ name
			+ '.xml';
			myself.droppedText(myself.getURL(url), name);
			}

			myself.getURL(libUrl).split('\n').forEach(function (line) {
				if (line.length > 0) {
				libMenu.addItem(
					line.substring(line.indexOf('\t') + 1),
					function () {
					loadLib(
						line.substring(0, line.indexOf('\t'))
					       );
					}
					);
				}
				});

			libMenu.popup(world, pos);
			},
			'Select categories of additional blocks to add to this project.'
				);


	menu.popup(world, pos);
}

IDE_Morph.prototype.downloadSTL = function() {
	var exporter = new THREE.STLExporter();
	var stlString = exporter.exportScene(this.stage.scene);
	var blob = new Blob([stlString], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, (this.projectName ? this.projectName : 'beetleblocks_export') + '.stl'); 
}

// IDE_Morph.prototype.createControlBar proxy
IDE_Morph.prototype.originalCreateControlBar = IDE_Morph.prototype.createControlBar;

IDE_Morph.prototype.createControlBar = function () {
	this.originalCreateControlBar();

	var myself = this,
	    colors = [
		    this.groupColor,
	    this.frameColor.darker(50),
	    this.frameColor.darker(50)
		    ];

	// cameraButton
	button = new PushButtonMorph(
			this,
			'cameraMenu',
			new SymbolMorph('camera', 14)
			);
	button.corner = 12;
	button.color = colors[0];
	button.highlightColor = colors[1];
	button.pressColor = colors[2];
	button.labelMinExtent = new Point(36, 18);
	button.padding = 0;
	button.labelShadowOffset = new Point(-1, -1);
	button.labelShadowColor = colors[1];
	button.labelColor = this.buttonLabelColor;
	button.contrast = this.buttonContrast;
	button.drawNew();
	// button.hint = 'edit settings';
	button.fixLayout();
	cameraButton = button;
	this.controlBar.add(cameraButton);
	this.controlBar.cameraButton = cameraButton; // for menu positioning	

	this.controlBar.originalFixLayout = this.controlBar.fixLayout;

	this.controlBar.fixLayout = function () {
		this.originalFixLayout();

		cameraButton.setCenter(myself.controlBar.center());
		cameraButton.setLeft(this.settingsButton.right() + 5);

		this.updateLabel();
	};

    	this.controlBar.originalUpdateLabel = this.controlBar.updateLabel;

    	this.controlBar.updateLabel = function() {
		this.originalUpdateLabel();
		this.label.setLeft(cameraButton.right() + 5);
	}
}

IDE_Morph.prototype.cameraMenu = function () {
	var menu,
	    stage = this.stage,
	    world = this.world(),
	    myself = this,
	    pos = this.controlBar.cameraButton.bottomLeft(),
	    shiftClicked = (world.currentKey === 16);

	function addPreference(label, toggle, test, onHint, offHint, hide) {
		var on = '\u2611 ',
		    off = '\u2610 ';
		if (!hide || shiftClicked) {
			menu.addItem(
					(test ? on : off) + localize(label),
					toggle,
					test ? onHint : offHint,
					hide ? new Color(100, 0, 0) : null
				    );
		}
	}

	menu = new MenuMorph(this);
	menu.addItem(
		'Reset camera',
		function() { stage.resetCamera() }
		);
	menu.addLine();
	menu.addItem(
		'Set background color', 
		function(){ 
			this.pickColor(null, function(color) { 
				stage.renderer.setClearColor('rgb(' + color.r + ',' + color.g + ',' + color.b + ')', 1);
				stage.reRender();
			})
		});
	menu.addLine();
	addPreference(
			'Wireframe mode',
			function() { stage.renderer.toggleWireframe() },
			stage.renderer.isWireframeMode,
			'uncheck to disable wireframe mode',
			'check to enable wireframe mode',
			false
		     );
	addPreference(
			'Show axes',
			function(){ stage.renderer.toggleAxes() },
			stage.renderer.showingAxes,
			'uncheck to hide x/y/z axes',
			'check to show x/y/z axes',
			false
			);
	menu.addLine();
	addPreference(
			'Show grid',
			function(){ stage.scene.grid.toggle() },
			stage.scene.grid.visible,
			'uncheck to hide x/y grid',
			'check to show x/y grid',
			false
		     );
	menu.addItem(
		'Set grid interval',
		function(){
			new DialogBoxMorph(
		        this,
		        function(point) { stage.scene.grid.setInterval(point) },
		        this
		    ).promptVector(
		        'Grid intervals',
		        stage.scene.grid.interval, // current
		        new Point(1, 1), // default
		        'x interval',
		        'y interval',
		        this.world(),
		        null, // pic
		        null // msg
		    );
		});
	menu.addItem(
		'Set grid color', 
		function(){ 
			this.pickColor(null, function(color) { 
				stage.scene.grid.setColor('0x' + color.r.toString(16) + color.g.toString(16) + color.b.toString(16));
				stage.reRender();
			})
		});
	menu.popup(world, pos);
};

IDE_Morph.prototype.originalSetStageExtent = IDE_Morph.prototype.setStageExtent;
IDE_Morph.prototype.setStageExtent = function (aPoint) {
	this.originalSetStageExtent(aPoint);
	this.stage.renderer.setSize(aPoint.x, aPoint.y);
	this.stage.reRender();
}

// Single Morph mode

IDE_Morph.prototype.createCorral = function(){}
IDE_Morph.prototype.createCorralBar = function(){}

IDE_Morph.prototype.fixLayout = function (situation) {
    // situation is a string, i.e.
    // 'selectSprite' or 'refreshPalette' or 'tabEditor'
    var padding = this.padding;

    Morph.prototype.trackChanges = false;

    if (situation !== 'refreshPalette') {
        // controlBar
        this.controlBar.setPosition(this.logo.topRight());
        this.controlBar.setWidth(this.right() - this.controlBar.left());
        this.controlBar.fixLayout();

        // categories
        this.categories.setLeft(this.logo.left());
        this.categories.setTop(this.logo.bottom());
    }

    // palette
    this.palette.setLeft(this.logo.left());
    this.palette.setTop(this.categories.bottom());
    this.palette.setHeight(this.bottom() - this.palette.top());

    if (situation !== 'refreshPalette') {
        // stage
        if (this.isAppMode) {
            this.stage.setScale(Math.floor(Math.min(
                (this.width() - padding * 2) / this.stage.dimensions.x,
                (this.height() - this.controlBar.height() * 2 - padding * 2)
                    / this.stage.dimensions.y
            ) * 10) / 10);
            this.stage.setCenter(this.center());
        } else {
//            this.stage.setScale(this.isSmallStage ? 0.5 : 1);
            this.stage.setScale(this.isSmallStage ? this.stageRatio : 1);
            this.stage.setTop(this.logo.bottom() + padding);
            this.stage.setRight(this.right());
        }

        // spriteBar
        this.spriteBar.setPosition(this.logo.bottomRight().add(padding));
        this.spriteBar.setExtent(new Point(
            Math.max(0, this.stage.left() - padding - this.spriteBar.left()),
            this.categories.bottom() - this.spriteBar.top() - padding
        ));
        this.spriteBar.fixLayout();

        // spriteEditor
        if (this.spriteEditor.isVisible) {
            this.spriteEditor.setPosition(this.spriteBar.bottomLeft());
            this.spriteEditor.setExtent(new Point(
                this.spriteBar.width(),
                this.bottom() - this.spriteEditor.top()
            ));
        }
    }

    Morph.prototype.trackChanges = true;
    this.changed();
};

IDE_Morph.prototype.selectSprite = function (sprite) {
    this.currentSprite = sprite;
    this.createPalette();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.fixLayout('selectSprite');
    this.currentSprite.scripts.fixMultiArgs();
};

IDE_Morph.prototype.toggleAppMode = function (appMode) {
    var world = this.world(),
        elements = [
            this.logo,
            this.controlBar.cameraButton,
            this.controlBar.cloudButton,
            this.controlBar.projectButton,
            this.controlBar.settingsButton,
            this.controlBar.stageSizeButton,
            this.spriteBar,
            this.spriteEditor,
            this.palette,
            this.categories
        ];

    this.isAppMode = isNil(appMode) ? !this.isAppMode : appMode;

    Morph.prototype.trackChanges = false;
    if (this.isAppMode) {
        this.setColor(this.appModeColor);
        this.controlBar.setColor(this.color);
        this.controlBar.appModeButton.refresh();
        elements.forEach(function (e) {
            e.hide();
        });
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.hide();
            }
        });
    } else {
        this.setColor(this.backgroundColor);
        this.controlBar.setColor(this.frameColor);
        elements.forEach(function (e) {
            e.show();
        });
        this.stage.setScale(1);
        // show all hidden dialogs
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.show();
            }
        });
        // prevent scrollbars from showing when morph appears
        world.allChildren().filter(function (c) {
            return c instanceof ScrollFrameMorph;
        }).forEach(function (s) {
            s.adjustScrollBars();
        });
    }
    this.setExtent(this.world().extent()); // resume trackChanges
};

