// Beetle Blocks cloud
// Inspired in Snap! cloud

function BeetleCloud (url) {
    this.init(url);
};

BeetleCloud.prototype.init = function (url) {
    this.url = url;
    this.checkCredentials();
};

BeetleCloud.prototype.parseDict = Cloud.prototype.parseDict;
BeetleCloud.prototype.encodeDict = Cloud.prototype.encodeDict;

BeetleCloud.prototype.clear = function () {
    this.username = null;
};

BeetleCloud.prototype.get = function (path, callBack, errorCall, errorMsg) {
    var request = new XMLHttpRequest(),
        myself = this;

    try {
        request.open(
            'GET',
            this.url + path,
            true
        );
        request.setRequestHeader(
            'Content-Type',
            'application/json; charset=utf-8'
        );

        request.withCredentials = true;

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    var response = JSON.parse(request.responseText);
                    if (!response.error) {
                        callBack.call(null, response);
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            errorMsg
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        errorMsg
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }

};

BeetleCloud.prototype.post = function (path, body, callBack, errorCall, errorMsg) {
    var request = new XMLHttpRequest(),
        myself = this;
    try {
        request.open(
            'POST',
            this.url + path,
            true
        );
        request.setRequestHeader(
            'Content-Type',
            'application/json'
        );

        request.withCredentials = true;

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    var response = JSON.parse(request.responseText);
                    if (response.error) {
                        errorCall.call(
                            this,
                            response.error,
                            'BeetleCloud'
                        );
                    } else {
                        callBack.call(
                            null,
                            response.text,
                            'BeetleCloud'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url + path,
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(body);
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }

};

BeetleCloud.prototype.getCurrentUser = function (callback, errorCallback) {
    this.get('/user', callback, errorCallback, 'Could not retrieve current user');
};

BeetleCloud.prototype.checkCredentials = function (callback, errorCallback) {
    var myself = this;
    this.getCurrentUser(
            function (user) { 
                if (user.username) {
                    myself.username = user.username;
                }
                if (callback) { callback.call(null, user); }
            },
            errorCallback);
};

BeetleCloud.prototype.logout = function (callBack, errorCall) {
    this.get('/users/logout', callBack, errorCall, 'logout failed');
};

BeetleCloud.prototype.shareProject = function (shareOrNot, projectName, callBack, errorCall) {
    var myself = this;

    this.checkCredentials(
            function (user) {
                if (user.username) { 
                    myself.get('/users/' + encodeURIComponent(user.username)
                            + '/projects/' + encodeURIComponent(projectName)
                            + '/visibility?ispublic=' + shareOrNot, // path
                            callBack, // ok callback
                            errorCall, // error callback
                            (shareOrNot ? 'S' : 'Uns') + 'haring failed'); // error message
                } else {
                    errorCall.call(this, 'You are not logged in', 'BeetleCloud');
                }
            },
            errorCall
            );
};

BeetleCloud.prototype.saveProject = function (ide, callBack, errorCall) {
    var myself = this;

    this.checkCredentials(
            function (user) {
                if (user.username) {
                    var pdata = ide.serializer.serialize(ide.stage);
                    // check if serialized data can be parsed back again
                    try {
                        ide.serializer.parse(pdata);
                    } catch (err) {
                        ide.showMessage('Serialization of program data failed:\n' + err);
                        throw new Error('Serialization of program data failed:\n' + err);
                    }

                    ide.showMessage('Uploading project...'); 

                    //(path, body, callBack, errorCall, errorMsg)
                    myself.post(
                            '/projects/save?projectname='
                            + encodeURIComponent(ide.projectName)
                            + '&username='
                            + encodeURIComponent(myself.username)
                            + '&ispublic=false', // path
                            pdata, // body
                            callBack,
                            errorCall,
                            'Project could not be saved' // error message
                            )

                } else {
                    errorCall.call(this, 'You are not logged in', 'BeetleCloud');
                    return;
                }
            }
    );

};

// Backwards compatibility with old cloud, to be removed

BeetleCloud.prototype.getPublicProject = function (
    id,
    callBack,
    errorCall
) {
    // id is Username=username&projectName=projectname,
    // where the values are url-component encoded
    // callBack is a single argument function, errorCall takes two args

    var parsedId = id.split('&').map(function(each){return each.split('=')[1]}),
        username = decodeURIComponent(parsedId[0]),
        projectName = decodeURIComponent(parsedId[1]);

    this.fetchProject(projectName, callBack, errorCall, username);
};

BeetleCloud.prototype.fetchProject = function (projectName, callBack, errorCall, publicUsername) {
    var myself = this;

    this.checkCredentials(
            function (user) {
                var username = publicUsername || user.username;
                if (!username) {
                    errorCall.call(this, 'Project could not be fetched', 'BeetleCloud');
                    return;
                } else {
                    myself.get(
                            '/users/'
                            + encodeURIComponent(username)
                            + '/projects/'
                            + encodeURIComponent(projectName),
                            function (response) { callBack.call(null, response.contents); },
                            errorCall,
                            'Could not fetch project'
                            )
                }
            },
            errorCall
            );
};

BeetleCloud.prototype.deleteProject = function (projectName, callBack, errorCall) {
    var myself = this;

    this.checkCredentials(
            function (user) {
                if (!user.username) {
                    errorCall.call(this, 'You are not logged in', 'BeetleCloud');
                    return;
                } else {
                    myself.get(
                            '/users/'
                            + encodeURIComponent(user.username)
                            + '/projects/'
                            + encodeURIComponent(projectName)
                            + '/delete',
                            function (response) { callBack.call(null, response.text); },
                            errorCall,
                            'Could not delete project'
                            );
                }
            },
            errorCall
            );
}

BeetleCloud.prototype.getProjectList = function (callBack, errorCall) {
    var myself = this;

    this.checkCredentials(
            function (user) {
                if (!user.username) {
                    errorCall.call(this, 'You are not logged in', 'BeetleCloud');
                    return;
                } else {
                    myself.get(
                            '/users/'
                            + encodeURIComponent(myself.username)
                            + '/projects',
                            function (response) { 
                                if (Object.keys(response).length > 0) {
                                    response.forEach(function(eachProject) {
                                        // This looks absurd, but PostgreSQL doesn't respect case
                                        eachProject.Public = eachProject.ispublic ? 'true' : 'false'; // compatibility with old cloud
                                        eachProject.ProjectName = eachProject.projectname;
                                        eachProject.Thumbnail = eachProject.thumbnail;
                                        eachProject.Updated = eachProject.updated;
                                        eachProject.Notes = eachProject.notes;
                                    });
                                    callBack.call(null, response);
                                } else {
                                    callBack.call(null, []);
                                } 
                            },
                            errorCall,
                            'Could not fetch project list'
                            );
                }
            },
            errorCall
            );
};


// Backwards compatibility with old cloud
// To be removed when we finish moving to the new cloud
BeetleCloud.prototype.parseResponse = function (usr) {
    return [{ username: usr, password: 'nope' }];
};

var SnapCloud = new BeetleCloud(
    //'http://localhost:9090/api' // To be changed to HTTPS, and the actual URL
    'http://45.55.194.180:9090/api' // To be changed to HTTPS, and the actual URL
);


// Overrides to be moved to the proper corresponding files after this goes live

// gui.js

// In the BeetleCloud we allow uppercase characters in usernames
// so we need to override this function
IDE_Morph.prototype.openIn = function (world) {
    var hash, myself = this, urlLanguage = null;

    SnapCloud.checkCredentials(
            function (user) {
                if (user.username) {
                    myself.source = 'cloud';
                }
            });

    this.buildPanes();
    world.add(this);
    world.userMenu = this.userMenu;

    // override SnapCloud's user message with Morphic
    SnapCloud.message = function (string) {
        var m = new MenuMorph(null, string),
            intervalHandle;
        m.popUpCenteredInWorld(world);
        intervalHandle = setInterval(function () {
            m.destroy();
            clearInterval(intervalHandle);
        }, 2000);
    };

    // prevent non-DialogBoxMorphs from being dropped
    // onto the World in user-mode
    world.reactToDropOf = function (morph) {
        if (!(morph instanceof DialogBoxMorph)) {
            if (world.hand.grabOrigin) {
                morph.slideBackTo(world.hand.grabOrigin);
            } else {
                world.hand.grab(morph);
            }
        }
    };

    this.reactToWorldResize(world.bounds);

    function getURL(url) {
        try {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send();
            if (request.status === 200) {
                return request.responseText;
            }
            throw new Error('unable to retrieve ' + url);
        } catch (err) {
            myself.showMessage('unable to retrieve project');
            return '';
        }
    }

    // This function returns the value of a parameter given its key
    function getParameterByName(name) {
        var param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
            regex = new RegExp('[\\?&]' + param + '=([^&#]*)'),
        results = regex.exec(location.href);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // dynamic notifications from non-source text files
    // has some issues, commented out for now
    /*
    this.cloudMsg = getURL('http://snap.berkeley.edu/cloudmsg.txt');
    motd = getURL('http://snap.berkeley.edu/motd.txt');
    if (motd) {
        this.inform('Snap!', motd);
    }
    */
    function interpretUrlAnchors() {
        var dict;
        if (location.hash.substr(0, 6) === '#open:') {
            hash = location.hash.substr(6);
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            if (contains(
                    ['project', 'blocks', 'sprites', 'snapdata'].map(
                        function (each) {
                            return hash.substr(0, 8).indexOf(each);
                        }
                    ),
                    1
                )) {
                this.droppedText(hash);
            } else {
                this.droppedText(getURL(hash));
            }
        } else if (location.hash.substr(0, 5) === '#run:') {
            hash = location.hash.substr(5);
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            if (hash.substr(0, 8) === '<project>') {
                this.rawOpenProjectString(hash);
            } else {
                this.rawOpenProjectString(getURL(hash));
            }
            this.toggleAppMode(true);
            this.runScripts();
        } else if (location.hash.substr(0, 9) === '#present:') {
            this.shield = new Morph();
            this.shield.color = this.color;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            dict = SnapCloud.parseDict(location.hash.substr(9));

            SnapCloud.getPublicProject(
                SnapCloud.encodeDict(dict),
                function (projectData) {
                    var msg;
                    myself.nextSteps([
                        function () {
                            msg = myself.showMessage('Opening project...');
                        },
                        function () {nop(); }, // yield (bug in Chrome)
                        function () {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        function () {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();

                            if (dict.editMode) {
                                myself.toggleAppMode(false);
                            } else {
                                myself.toggleAppMode(true);
                            }

                            if (!dict.noRun) {
                                myself.runScripts();
                            }

                            if (dict.hideControls) {
                                myself.controlBar.hide();
                                window.onbeforeunload = function () {nop(); };
                            }
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 7) === '#cloud:') {
            this.shield = new Morph();
            this.shield.alpha = 0;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            dict = SnapCloud.parseDict(location.hash.substr(7));

            SnapCloud.getPublicProject(
                SnapCloud.encodeDict(dict),
                function (projectData) {
                    var msg;
                    myself.nextSteps([
                        function () {
                            msg = myself.showMessage('Opening project...');
                        },
                        function () {nop(); }, // yield (bug in Chrome)
                        function () {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        function () {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();
                            myself.toggleAppMode(false);
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 6) === '#lang:') {
            urlLanguage = location.hash.substr(6);
            this.setLanguage(urlLanguage);
            this.loadNewProject = true;
        } else if (location.hash.substr(0, 7) === '#signup') {
            this.createCloudAccount();
        }
    }

    if (this.userLanguage) {
        this.setLanguage(this.userLanguage, interpretUrlAnchors);
    } else {
        interpretUrlAnchors.call(this);
    }
};

IDE_Morph.prototype.projectMenu = function () {
    var menu,
        myself = this,
        world = this.world(),
        pos = this.controlBar.projectButton.bottomLeft(),
        graphicsName = this.currentSprite instanceof SpriteMorph ?
            'Costumes' : 'Backgrounds',
        shiftClicked = (world.currentKey === 16);

    SnapCloud.checkCredentials(function (user) {

        menu = new MenuMorph(myself);
        menu.addItem('New', 'createNewProject');
        menu.addItem(
                'Import project or blocks',
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

        if (SnapCloud.username) {
            menu.addLine();
            menu.addItem('My Profile', function () { window.open('/users/' + SnapCloud.username, true) });
            menu.addItem('My Projects', function () { window.open('/myprojects', true) });
        }
        menu.addItem(
                'Migrate from the old cloud', 
                function () { window.open('/migration', true) },
                'Attempt to perform an automatic\nmigration of all your projects\nin the old cloud');

        menu.addLine();
        menu.addItem('Save                                       Ctrl+S', 'save');
        menu.addItem('Save As...', 'saveProjectsBrowser');

        menu.addLine();
        menu.addItem('Download project as...', 'saveProjectToDisk');
        menu.addItem(
                'Download My Blocks as...',
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
                'Download 2D lines as...',
                function() { myself.downloadSVG() },
                'download the currently rendered 2D lines\ninto an SVG file'
                );

        var submenu = new MenuMorph(myself);
        submenu.addItem(
                'STL',
                function () { myself.downloadSTL() },
                'download the currently rendered 3D model\ninto an STL file ready to be printed'
                );
        submenu.addItem(
                'STL (binary)',
                function () { myself.downloadBinarySTL() },
                'download the currently rendered 3D model\ninto an STL file ready to be printed'
                );
        submenu.addItem(
                'OBJ',
                function () { myself.downloadOBJ() },
                'download the currently rendered 3D model\ninto an OBJ file'
                );

        menu.addHoverItem(
                'Download 3D model as...          ▶',
                submenu
                );


        menu.addItem(
                'Libraries...',
                function () {
                    // read a list of libraries from an external file,
                    var libMenu = new MenuMorph(myself, 'Import library'),
                    libUrl = 'libraries/LIBRARIES';

                    function loadLib(name) {
                        var url = 'libraries/'
                            + name
                            + '.xml';
                        myself.droppedText(myself.getURL(url), name);
                    }

                    myself.getURL(libUrl).split('\n').forEach(function (line) {
                        if (line.length > 0) {
                            libMenu.addItem(
                                    line.substring(line.indexOf('\t') + 1),
                                    function () { loadLib(line.substring(0, line.indexOf('\t'))) }
                                    );
                        }
                    });

                    libMenu.popup(world, pos);
                },
                'Select categories of additional blocks to add to this project.'
                    );

        menu.addLine();

        if (shiftClicked) {
            menu.addItem(
                    'Cloud url...',
                    'setCloudURL',
                    null,
                    new Color(100, 0, 0)
                    );
            menu.addLine();
        }
        if (!SnapCloud.username) {
            menu.addItem(
                    'Login',
                    function () { window.open('/login'); }
                    );
            menu.addItem(
                    'Create an account',
                    function () { window.open('/signup'); }
                    );
            menu.addItem(
                    'Reset Password...',
                    'resetCloudPassword'
                    );
        } else {
            menu.addItem(
                    localize('Logout') + ' / ' + SnapCloud.username,
                    'logout'
                    );
        }
        menu.addItem(
                'Start tutorial',
                function() {
                    myself.startTutorial(world);
                }
                );

        if (shiftClicked) {
            menu.addLine();
            menu.addItem(
                    'open shared project from cloud...',
                    function () {
                        myself.prompt('Author name…', function (usr) {
                            myself.prompt('Project name...', function (prj) {
                                var id = 'Username=' +
                                    encodeURIComponent(usr.toLowerCase()) +
                                    '&ProjectName=' +
                                    encodeURIComponent(prj);
                                myself.showMessage(
                                        'Fetching project\nfrom the cloud...'
                                        );
                                SnapCloud.getPublicProject(
                                        id,
                                        function (projectData) {
                                            var msg;
                                            if (!Process.prototype.isCatchingErrors) {
                                                window.open(
                                                        'data:text/xml,' + projectData
                                                        );
                                            }
                                            myself.nextSteps([
                                                    function () {
                                                        msg = myself.showMessage(
                                                                'Opening project...'
                                                                );
                                                    },
                                                    function () {nop(); }, // yield (Chrome)
                                                    function () {
                                                        myself.rawOpenCloudDataString(
                                                                projectData
                                                                );
                                                    },
                                                    function () {
                                                        msg.destroy();
                                                    }
                                            ]);
                                        },
                                        myself.cloudError()
                                            );

                            }, null, 'project');
                        }, null, 'project');
                    },
                    null,
                    new Color(100, 0, 0)
                        );
        }
        menu.popup(world, pos); 
    });
};

ProjectDialogMorph.prototype.originalBuildContents = ProjectDialogMorph.prototype.buildContents;
ProjectDialogMorph.prototype.buildContents = function () {
    var notification, myself = this;

    SnapCloud.checkCredentials(
            function (user) {
                if (user.username) {
                    myself.source = 'cloud';
                }
            });

    this.originalBuildContents();

    if (this.ide.cloudMsg) {
        notification = new TextMorph(
                this.ide.cloudMsg,
                10,
                null, // style
                false, // bold
                null, // italic
                null, // alignment
                null, // width
                null, // font name
                new Point(1, 1), // shadow offset
                new Color(255, 255, 255) // shadowColor
                );
        notification.refresh = nop;
        this.srcBar.add(notification);
    }
    if (notification) {
        this.setExtent(new Point(840, 630).add(notification.extent()));
    } else {
        this.setExtent(new Point(840, 630));
    }
    this.fixLayout();
};

ProjectDialogMorph.prototype.deleteProject = function () {
    var myself = this,
    proj,
    idx,
    name;

    if (this.source === 'cloud') {
        proj = this.listField.selected;
        if (proj) {
            this.ide.confirm(
                    localize(
                        'Are you sure you want to delete'
                        ) + '\n"' + proj.ProjectName + '"?',
                    'Delete Project',
                    function () {
                        SnapCloud.deleteProject(
                                proj.ProjectName,
                                function () {
                                    myself.ide.hasChangedMedia = true;
                                    idx = myself.projectList.indexOf(proj);
                                    myself.projectList.splice(idx, 1);
                                    myself.installCloudProjectList(myself.projectList);
                                },
                                function (err, lbl) {
                                    myself.ide.cloudError().call(null, err, lbl);
                                }
                                );
                    }
                    );
        }
    } else { // 'local, examples'
        if (this.listField.selected) {
            name = this.listField.selected.name;
            this.ide.confirm(
                    localize(
                        'Are you sure you want to delete'
                        ) + '\n"' + name + '"?',
                    'Delete Project',
                    function () {
                        delete localStorage['-snap-project-' + name];
                        myself.setSource(myself.source); // refresh list
                    }
                    );
        }
    }
};

ProjectDialogMorph.prototype.shareProject = function () {
    var myself = this,
    ide = this.ide,
    proj = this.listField.selected,
    entry = this.listField.active;

    if (proj) {
        this.ide.confirm(
                localize(
                    'Are you sure you want to publish'
                    ) + '\n"' + proj.ProjectName + '"?',
                'Share Project',
                function () {
                    myself.ide.showMessage('sharing\nproject...');
                    SnapCloud.shareProject(
                            true, // make public
                            proj.ProjectName,
                            function () {
                                proj.Public = 'true';
                                myself.unshareButton.show();
                                myself.shareButton.hide();
                                entry.label.isBold = true;
                                entry.label.drawNew();
                                entry.label.changed();
                                myself.buttons.fixLayout();
                                myself.drawNew();
                                myself.ide.showMessage('shared.', 2);
                            },
                            myself.ide.cloudError()
                            );
                    // Set the Shared URL if the project is currently open
                    if (proj.ProjectName === ide.projectName) {
                        var usr = SnapCloud.username,
                            projectId = 'Username=' +
                                encodeURIComponent(usr.toLowerCase()) +
                                '&ProjectName=' +
                                encodeURIComponent(proj.ProjectName);
                        location.hash = 'present:' + projectId;
                    }
                }
        );
    }
};

ProjectDialogMorph.prototype.unshareProject = function () {
    var myself = this,
    ide = this.ide,
    proj = this.listField.selected,
    entry = this.listField.active;

    if (proj) {
        this.ide.confirm(
                localize(
                    'Are you sure you want to unpublish'
                    ) + '\n"' + proj.ProjectName + '"?',
                'Unshare Project',
                function () {
                    myself.ide.showMessage('unsharing\nproject...');
                    SnapCloud.shareProject(
                            false, // make not public
                            proj.ProjectName,
                            function () {
                                proj.Public = 'false';
                                myself.shareButton.show();
                                myself.unshareButton.hide();
                                entry.label.isBold = false;
                                entry.label.drawNew();
                                entry.label.changed();
                                myself.buttons.fixLayout();
                                myself.drawNew();
                                myself.ide.showMessage('unshared.', 2);
                            },
                            myself.ide.cloudError()
                            );
                    // Remove the shared URL if the project is open.
                    if (proj.ProjectName === ide.projectName) {
                        location.hash = '';
                    }
                }
        );
    }
};

// store.js

SnapSerializer.prototype.thumbnailSize = new Point(480, 360);
