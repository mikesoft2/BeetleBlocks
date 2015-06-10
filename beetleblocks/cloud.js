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
}

