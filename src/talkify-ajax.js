talkify = talkify || {};
talkify.http = (function ajax() {

    var get = function(url) {
        var call = new promise.promise.Promise();

        var keypart = (url.indexOf('?') !== -1 ? "&key=" : "?key=") + talkify.config.remoteService.apiKey;

        promise.promise
            .get(window.talkify.config.remoteService.host + url + keypart)
            .then(function(error, data) {
                try {
                    var jsonObj = JSON.parse(data);
                    call.done(error, jsonObj);
                } catch (e) {
                    call.done(e, data);
                }

            });

        return call;
    };

    return {
        get: get
    };
})();