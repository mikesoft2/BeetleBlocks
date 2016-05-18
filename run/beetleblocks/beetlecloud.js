// Beetle Blocks cloud
// Inspired in Snap! cloud

var BeetleCloud;
var SnapCloud = new BeetleCloud(
    'http://45.55.194.180:9090/api' // To be changed to HTTPS, and the actual URL
);

function BeetleCloud(url) {
    this.username = null;
    this.password = null; // Sent over HTTPS to be later hashed and checked against the DB at server side
    this.url = url;
}

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

BeetleCloud.prototype.fetchProject = function (projectName, callBack, errorCall) {
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


// Overrides to be moved to the proper corresponding files after this goes live

// gui.js

IDE_Morph.prototype.createCloudAccount = function () {
    var myself = this,
        world = this.world();

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
                        str = SnapCloud.encodeDict(
                            {
                                username: user.username,
                                token: user.token
                            }
                        );
                        localStorage['-snap-user'] = str;
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
