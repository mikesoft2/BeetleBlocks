// Beetle Blocks cloud
// Inspired in Snap! cloud

var BeetleCloud;
var SnapCloud = new BeetleCloud(
    //'http://localhost:9090/api' // To be changed to HTTPS, and the actual URL
    'http://45.55.194.180:9090/api' // To be changed to HTTPS, and the actual URL
);

function BeetleCloud(url) {
    this.username = null;
    this.password = null; // Sent over HTTPS to be later hashed and checked against the DB at server side
    this.url = url;
}

BeetleCloud.prototype.parseDict = Cloud.prototype.parseDict;
BeetleCloud.prototype.encodeDict = Cloud.prototype.encodeDict;

BeetleCloud.prototype.clear = function () {
    this.username = null;
    this.password = null;
}

BeetleCloud.prototype.signup = function (
    username,
    email,
    password,
    callBack,
    errorCall
) {
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest(),
        myself = this;
    try {
        request.open(
            'POST',
            this.url
                + '/users/new?username=' 
                + encodeURIComponent(username)
                + '&password='
                + encodeURIComponent(password)
                + '&email=' 
                + encodeURIComponent(email),
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
                            'Signup'
                        );
                    } else {
                        callBack.call(
                            null,
                            response.text,
                            'Signup'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url + '/users/new',
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(null);
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }
};

BeetleCloud.prototype.login = function (
    username,
    password,
    callBack,
    errorCall
) {
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest(),
        myself = this;

    try {
        request.open(
            'GET',
            this.url
                + '/users/login?username=' 
                + encodeURIComponent(username)
                + '&password='
                + encodeURIComponent(password),
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
                        myself.username = username;
                        callBack.call(null, { username: username }, 'BeetleCloud');
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            'connection failed'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }
};

BeetleCloud.prototype.logout = function (callBack, errorCall) {
    var request = new XMLHttpRequest(),
        myself = this;

    this.clear();

    try {
        request.open(
            'GET',
            this.url + '/users/logout',
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
                        callBack.call(null, 'BeetleCloud');
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            'logout failed'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('could not log out!')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }

};

BeetleCloud.prototype.saveProject = function (ide, callBack, errorCall) {
    var request = new XMLHttpRequest(),
        myself = this,
        pdata = ide.serializer.serialize(ide.stage);

    if (!this.username) {
        errorCall.call(this, 'You are not logged in', 'BeetleCloud');
        return;
    }

    // check if serialized data can be parsed back again
    try {
        ide.serializer.parse(pdata);
    } catch (err) {
        ide.showMessage('Serialization of program data failed:\n' + err);
        throw new Error('Serialization of program data failed:\n' + err);
    }
    
    ide.showMessage('Uploading project...');

    try {
        request.open(
            'POST',
            this.url 
            + '/projects/save?projectname='
            + encodeURIComponent(ide.projectName)
            + '&ispublic=true' // TO BE CHANGED!
            + '&username='
            + encodeURIComponent(myself.username),
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
                        callBack.call(null, 'BeetleCloud');
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            'Saving failed'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('Project could not be saved')
                    );
                }
            }
        };
        request.send(pdata);
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }
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
    var request = new XMLHttpRequest(),
        myself = this,
        username = publicUsername || this.username;

    if (!username) {
        errorCall.call(this, 'Project could not be fetched', 'BeetleCloud');
        return;
    }

    try {
        request.open(
            'GET',
            this.url 
            + '/users/'
            + encodeURIComponent(username)
            + '/projects/'
            + encodeURIComponent(projectName),
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
                    if (!response.error && response.contents) {
                        callBack.call(null, response.contents);
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            'Could not fetch project'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('Could not fetch project')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }

};

BeetleCloud.prototype.deleteProject = function (projectName, callBack, errorCall) {
    var request = new XMLHttpRequest(),
        myself = this;

    if (!this.username) {
        errorCall.call(this, 'You are not logged in', 'BeetleCloud');
        return;
    }

    try {
        request.open(
            'GET',
            this.url 
            + '/users/'
            + encodeURIComponent(this.username)
            + '/projects/'
            + encodeURIComponent(projectName)
            + '/delete',
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
                    if (!response.error && response.text) {
                        callBack.call(null, response.text);
                    } else {
                        console.log(response);
                        errorCall.call(
                            null,
                            response.error,
                            'Could not delete project'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('Could not delete project')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }

}

BeetleCloud.prototype.getProjectList = function (callBack, errorCall) {
    var request = new XMLHttpRequest(),
        myself = this;

    if (!this.username) {
        errorCall.call(this, 'You are not logged in', 'BeetleCloud');
        return;
    }

    try {
        request.open(
            'GET',
            this.url 
            + '/users/'
            + encodeURIComponent(myself.username)
            + '/projects',
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
                        if (Object.keys(response).length > 0) {
                            response.forEach(function(eachProject) {
                                // This looks absurd, but PostgreSQL doesn't respect case
                                eachProject.Public = eachProject.ispublic;
                                eachProject.ProjectName = eachProject.projectname;
                                eachProject.Thumbnail = eachProject.thumbnail;
                                eachProject.Updated = eachProject.updated;
                                eachProject.Notes = eachProject.notes;
                            });
                            callBack.call(null, response);
                        } else {
                            callBack.call(null, []);
                        }
                    } else {
                        errorCall.call(
                            null,
                            response.error,
                            'Could not fetch project list'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('Could not fetch project list')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'BeetleCloud');
    }
};


// Backwards compatibility with old cloud
// To be removed when we finish moving to the new cloud
BeetleCloud.prototype.parseResponse = function (usr) {
    return [{ username: usr, password: 'nope' }];
};

// Overrides to be moved to the proper corresponding files after this goes live

// gui.js

IDE_Morph.prototype.createCloudAccount = function () {
    var myself = this,
        world = this.world();

    // We just redirect users to the web signup form.
    // Keeping old code in case we change our mind though

    window.open('/signup');

    /*
    new DialogBoxMorph(
        null,
        function (user) {
            SnapCloud.signup(
                user.username,
                user.email,
                user.password,
                function (txt, title) {
                    new DialogBoxMorph().inform(
                        title,
                        txt,
                        world,
                        myself.cloudIcon(null, new Color(0, 180, 0))
                    );
                },
                myself.cloudError()
            );
        }
    ).withKey('cloudsignup').promptCredentials(
        'Sign up',
        'signup',
        'http://beetleblocks.com/tos',
        'Terms of Service...',
        'http://beetleblocks.com/privacy',
        'Privacy...',
        'I have read and agree\nto the Terms of Service',
        world,
        myself.cloudIcon(),
        myself.cloudMsg
    );
    */
};

IDE_Morph.prototype.initializeCloud = function () {
    var myself = this,
        world = this.world();
    new DialogBoxMorph(
        null,
        function (user) {
            SnapCloud.login(
                user.username,
                user.password,
                function () {
                    var str;
                    if (user.choice) {
                        localStorage['-snap-user'] = user.username;
                    }
                    myself.source = 'cloud';
                    myself.showMessage('now connected.', 2);
                },
                myself.cloudError()
            );
        }
    ).withKey('cloudlogin').promptCredentials(
        'Sign in',
        'login',
        null,
        null,
        null,
        null,
        'stay signed in on this computer\nuntil logging out',
        world,
        myself.cloudIcon(),
        myself.cloudMsg
    );
};

// In the BeetleCloud we allow uppercase characters in usernames
// so we need to override this function
IDE_Morph.prototype.openIn = function (world) {
    var hash, usr, myself = this, urlLanguage = null;

    // get persistent user data, if any
    if (localStorage) {
        usr = localStorage['-snap-user'];
        if (usr) {
            usr = SnapCloud.parseResponse(usr)[0];
            if (usr) {
                SnapCloud.username = usr.username || null;
                SnapCloud.password = usr.password || null;
                if (SnapCloud.username) {
                    this.source = 'cloud';
                }
            }
        }
    }

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

ProjectDialogMorph.prototype.rawOpenCloudProject = function (proj) {
    var myself = this;
    SnapCloud.fetchProject(
            proj.ProjectName, 
            function (response) {
                myself.ide.source = 'cloud';
                myself.ide.droppedText(response);
                if (proj.Public === 'true') {
                    location.hash = '#present:Username=' +
                        encodeURIComponent(SnapCloud.username) +
                        '&ProjectName=' +
                        encodeURIComponent(proj.ProjectName);
                }
            },
            myself.ide.cloudError()
            );
    this.destroy();
};

ProjectDialogMorph.prototype.originalBuildContents = ProjectDialogMorph.prototype.buildContents;
ProjectDialogMorph.prototype.buildContents = function () {
    var notification;

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

// widgets.js

DialogBoxMorph.prototype.promptCredentials = function (
    title,
    purpose,
    tosURL,
    tosLabel,
    prvURL,
    prvLabel,
    checkBoxLabel,
    world,
    pic,
    msg
) {
    var usr = new InputFieldMorph(),
        bmn,
        byr,
        emlLabel,
        eml = new InputFieldMorph(),
        pw1 = new InputFieldMorph(),
        pw2 = new InputFieldMorph(),
        opw = new InputFieldMorph(),
        agree = false,
        chk,
        dof = new AlignmentMorph('row', 4),
        mCol = new AlignmentMorph('column', 2),
        yCol = new AlignmentMorph('column', 2),
        inp = new AlignmentMorph('column', 2),
        lnk = new AlignmentMorph('row', 4),
        bdy = new AlignmentMorph('column', this.padding),
        years = {},
        currentYear = new Date().getFullYear(),
        firstYear = currentYear - 20,
        myself = this;

    function labelText(string) {
        return new TextMorph(
            localize(string),
            10,
            null, // style
            false, // bold
            null, // italic
            null, // alignment
            null, // width
            null, // font name
            MorphicPreferences.isFlat ? null : new Point(1, 1),
            new Color(255, 255, 255) // shadowColor
        );
    }

    function linkButton(label, url) {
        var btn = new PushButtonMorph(
            myself,
            function () {
                window.open(url);
            },
            '  ' + localize(label) + '  '
        );
        btn.fontSize = 10;
        btn.corner = myself.buttonCorner;
        btn.edge = myself.buttonEdge;
        btn.outline = myself.buttonOutline;
        btn.outlineColor = myself.buttonOutlineColor;
        btn.outlineGradient = myself.buttonOutlineGradient;
        btn.padding = myself.buttonPadding;
        btn.contrast = myself.buttonContrast;
        btn.drawNew();
        btn.fixLayout();
        return btn;
    }

    function age() {
        var today = new Date().getFullYear() + new Date().getMonth() / 12,
            year = +byr.getValue() || 0,
            monthName = bmn.getValue(),
            month,
            birthday;
        if (monthName instanceof Array) { // translatable
            monthName = monthName[0];
        }
        if (isNaN(year)) {
            year = 0;
        }
        month = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ].indexOf(monthName);
        if (isNaN(month)) {
            month = 0;
        }
        birthday = year + month / 12;
        return today - birthday;
    }

    bmn = new InputFieldMorph(
        null, // text
        false, // numeric?
        {
            'January' : ['January'],
            'February' : ['February'],
            'March' : ['March'],
            'April' : ['April'],
            'May' : ['May'],
            'June' : ['June'],
            'July' : ['July'],
            'August' : ['August'],
            'September' : ['September'],
            'October' : ['October'],
            'November' : ['November'],
            'December' : ['December']
        },
        true // read-only
    );
    for (currentYear; currentYear > firstYear; currentYear -= 1) {
        years[currentYear.toString() + ' '] = currentYear;
    }
    years[firstYear + ' ' + localize('or before')] = '< ' + currentYear;
    byr = new InputFieldMorph(
        null, // text
        false, // numeric?
        years,
        true // read-only
    );

    inp.alignment = 'left';
    inp.setColor(this.color);
    bdy.setColor(this.color);

    mCol.alignment = 'left';
    mCol.setColor(this.color);
    yCol.alignment = 'left';
    yCol.setColor(this.color);

    usr.setWidth(200);
    bmn.setWidth(100);
    byr.contents().minWidth = 80;
    byr.setWidth(80);
    eml.setWidth(200);
    pw1.setWidth(200);
    pw2.setWidth(200);
    opw.setWidth(200);
    pw1.contents().text.toggleIsPassword();
    pw2.contents().text.toggleIsPassword();
    opw.contents().text.toggleIsPassword();

    if (purpose === 'login') {
        inp.add(labelText('User name:'));
        inp.add(usr);
    }

    if (purpose === 'signup') {
        inp.add(labelText('User name:'));
        inp.add(usr);
        inp.add(labelText('Password:'));
        inp.add(pw1);
        inp.add(labelText('Repeat password:'));
        inp.add(pw2);
        emlLabel = labelText('foo');
        inp.add(emlLabel);
        inp.add(eml);
    }

    if (purpose === 'login') {
        inp.add(labelText('Password:'));
        inp.add(pw1);
    }

    if (purpose === 'changePassword') {
        inp.add(labelText('Old password:'));
        inp.add(opw);
        inp.add(labelText('New password:'));
        inp.add(pw1);
        inp.add(labelText('Repeat new password:'));
        inp.add(pw2);
    }

    if (purpose === 'resetPassword') {
        inp.add(labelText('User name:'));
        inp.add(usr);
    }

    if (msg) {
        bdy.add(labelText(msg));
    }

    bdy.add(inp);

    if (tosURL || prvURL) {
        bdy.add(lnk);
    }
    if (tosURL) {
        lnk.add(linkButton(tosLabel, tosURL));
    }
    if (prvURL) {
        lnk.add(linkButton(prvLabel, prvURL));
    }

    if (checkBoxLabel) {
        chk = new ToggleMorph(
            'checkbox',
            this,
            function () {agree = !agree; }, // action,
            checkBoxLabel,
            function () {return agree; } //query
        );
        chk.edge = this.buttonEdge / 2;
        chk.outline = this.buttonOutline / 2;
        chk.outlineColor = this.buttonOutlineColor;
        chk.outlineGradient = this.buttonOutlineGradient;
        chk.contrast = this.buttonContrast;
        chk.drawNew();
        chk.fixLayout();
        bdy.add(chk);
    }

    dof.fixLayout();
    mCol.fixLayout();
    yCol.fixLayout();
    inp.fixLayout();
    lnk.fixLayout();
    bdy.fixLayout();

    this.labelString = title;
    this.createLabel();
    if (pic) {this.setPicture(pic); }

    this.addBody(bdy);

    usr.drawNew();
    dof.drawNew();
    mCol.drawNew();
    bmn.drawNew();
    yCol.drawNew();
    byr.drawNew();
    pw1.drawNew();
    pw2.drawNew();
    opw.drawNew();
    eml.drawNew();
    bdy.fixLayout();

    this.addButton('ok', 'OK');
    this.addButton('cancel', 'Cancel');
    this.fixLayout();
    this.drawNew();
    this.fixLayout();

    function validInputs() {
        var checklist,
            empty,
            em = eml.getValue();

        function indicate(morph, string) {
            var bubble = new SpeechBubbleMorph(localize(string));
            bubble.isPointingRight = false;
            bubble.drawNew();
            bubble.popUp(
                world,
                morph.leftCenter().subtract(new Point(bubble.width() + 2, 0))
            );
            if (morph.edit) {
                morph.edit();
            }
        }

        if (purpose === 'login') {
            checklist = [usr, pw1];
        } else if (purpose === 'signup') {
            checklist = [usr, eml, pw1, pw2];
        } else if (purpose === 'changePassword') {
            checklist = [opw, pw1, pw2];
        } else if (purpose === 'resetPassword') {
            checklist = [usr];
        }

        empty = detect(
            checklist,
            function (inp) {
                return !inp.getValue();
            }
        );
        if (empty) {
            indicate(empty, 'please fill out\nthis field');
            return false;
        }
        if (purpose === 'signup') {
            if (usr.getValue().length < 4) {
                indicate(usr, 'User name must be four\ncharacters or longer');
                return false;
            }
            if (em.indexOf(' ') > -1 || em.indexOf('@') === -1
                    || em.indexOf('.') === -1) {
                indicate(eml, 'please provide a valid\nemail address');
                return false;
            }
        }
        if (purpose === 'changePassword') {
            if (pw1.getValue().length < 6) {
                indicate(pw1, 'password must be six\ncharacters or longer');
                return false;
            }
            if (pw1.getValue() !== pw2.getValue()) {
                indicate(pw2, 'passwords do\nnot match');
                return false;
            }
        }
        if (purpose === 'signup') {
            if (!agree) {
                indicate(chk, 'please agree to\nthe TOS');
                return false;
            }
        }
        return true;
    }

    this.accept = function () {
        if (validInputs()) {
            DialogBoxMorph.prototype.accept.call(myself);
        }
    };

    this.edit = function () {
        if (purpose === 'changePassword') {
            opw.edit();
        } else { // 'signup', 'login', 'resetPassword'
            usr.edit();
        }
    };

    this.getInput = function () {
        return {
            username: usr.getValue(),
            email: eml.getValue(),
            oldpassword: opw.getValue(),
            password: pw1.getValue(),
            choice: agree
        };
    };

    this.reactToChoice = function () {
        if (purpose === 'signup') {
            emlLabel.changed();
            emlLabel.text = age() <= 13 ?
                    'E-mail address of parent or guardian:'
                        : 'E-mail address:';
            emlLabel.text = localize(emlLabel.text);
            emlLabel.drawNew();
            emlLabel.changed();
        }
    };

    this.reactToChoice(); // initialize e-mail label

    if (!this.key) {
        this.key = 'credentials' + title + purpose;
    }

    this.popUp(world);
};

// store.js

SnapSerializer.prototype.thumbnailSize = new Point(480, 360);
