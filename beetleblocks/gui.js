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
			function () {myself.exportGlobalBlocks(); },
			'show global custom block definitions as XML\nin a new browser window'
		    );

	if (shiftClicked) {
		menu.addItem(
				'Export all scripts as pic...',
				function () {myself.exportScriptsPicture(); },
				'show a picture of all scripts\nand block definitions',
				new Color(100, 0, 0)
			    );
	}

	menu.addItem(
			'Export 3D model as STL',
			function() { downloadSTL(myself.projectName) },
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
	menu.addItem('Reset camera', resetCamera);

	menu.addLine();
	addPreference(
			'Wireframe mode',
			toggleWireframe,
			isWireframe(),
			'uncheck to disable wireframe mode',
			'check to enable wireframe mode',
			false
		     );

/*	menu.addLine();
	addPreference(
			'Toggle axis',
			toggleAxis,
			showingAxis,
			'uncheck to hide x/y/z axis',
			'check to show x/y/z axis',
			false
		     );*/
	menu.popup(world, pos);
};

