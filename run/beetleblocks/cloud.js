Cloud.prototype.originalCallService = Cloud.prototype.callService;
Cloud.prototype.callService = function (
        serviceName,
        callBack,
        errorCall,
        args
        ) {
    this.originalCallService(serviceName, callBack, errorCall, args);
    switch (serviceName) {
        case 'publishProject':
            postRequest(
                    'project', 
                    {
                        projectName: args[0],
                        username: this.username,
                        thumbnail: args[1] // all publishProject calls need to send us the project thumbnail now
                    });
            return;
        case 'deleteProject':
        case 'unpublishProject':
            postRequest(
                    'delete-project',
                    {
                        projectName: args[0],
                        username: this.username,
                        thumbnail: '' // not needed
                    });
            return;
    };

    postRequest = function(entryPoint, data) {
        var request = new XMLHttpRequest();
        request.open(
                'POST',
                'http://snapp.citilab.eu:9999/' + entryPoint,
                true
                ); 
        request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        request.send(JSON.stringify(data));  
    };

};


Cloud.prototype.urlForMyProject = function (projectName) {
    if (!this.username) {
        ide.showMessage('You are not logged in:\n' + err);
        throw new Error('You are not logged in:\n' + err);
        return;
    }

    var id = 'Username=' + encodeURIComponent(this.username) + '&ProjectName=' + encodeURIComponent(projectName),
    url = (this.hasProtocol() ? '' : 'http://')
        + window.location.origin + window.location.pathname + '#present:'
        + id;
    return url;
};

