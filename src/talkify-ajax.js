talkify = talkify || {};
talkify.http = (function ajax() {

    var get = function(url) {
        var call = new promise.Promise();

        promise
            .get(window.talkify.config.host + url)
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