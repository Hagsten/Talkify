talkify = talkify || {};
talkify.http = (function ajax() {
    var get = function (url) {
        var keypart = (url.indexOf('?') !== -1 ? "&key=" : "?key=") + talkify.config.remoteService.apiKey;

        return fetch(window.talkify.config.remoteService.host + url + keypart)
            .then(function (res) {
                return res.json();
            });
    };

    return {
        get: get
    };
})();