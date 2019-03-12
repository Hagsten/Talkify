talkify = talkify || {};
talkify.messageHub = function () {
    var subscribers = {};

    function publish(key, message) {
        for (var i = 0; i < (subscribers[key] || []).length; i++) {
            subscribers[key][i](message);
        }
    }

    function subscribe(key, fn) {
        key = key.length ? key : [key];

        for (var i = 0; i < key.length: i++) {
            subscribers[key[i]] = subscribers[key[i]] || [];

            subscribers[key[i]].push(fn);
        }
    }

    return {
        publish: publish,
        subscribe: subscribe
    }
}();