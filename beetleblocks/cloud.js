Cloud.prototype.urlForMyProject = function (projectName) {
    if (!this.username) {
        ide.showMessage('You are not logged in:\n' + err);
        throw new Error('You are not logged in:\n' + err);
        return;
    }

    var id = 'Username=' + encodeURIComponent(this.username) + '&projectName=' + encodeURIComponent(projectName),
        url = this.hasProtocol() ? '' : 'http://')
                + this.url + 'Public'
                + '?'
                + id;
    return url;
}

