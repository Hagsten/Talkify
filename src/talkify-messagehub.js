talkify = talkify || {};
talkify.messageHub = function () {
    var subscribers = {};

    function publish(key, message) {
        console.log("Publishing", key);

        var topics = key.split('.');
        var candidates = [];

        Object.keys(subscribers).forEach(function (subscriberKey, index) {
            var s = subscriberKey.split('.');

            if (s.length != topics.length) {
                return;
            }

            var match = true;

            for (var i = 0; i < s.length; i++) {
                if(topics[i] === '*'){
                    match = true;
                }
                else if (s[i] === topics[i]) {
                    match = true;
                } else if (s[i] === "*") {
                    match === true;
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                candidates.push(subscriberKey);
            }
        });

        if(candidates.length === 0){
            console.warn("No subscriber found", key)
        }

        candidates.forEach(function (c) {
            subscribers[c].forEach(function (fn) {
                console.log("Calling subscriber", c, message);
                fn(message);
            });
        })

    }

    function subscribe(key, fn) {
        key = Array.isArray(key) ? key : [key];

        for (var i = 0; i < key.length; i++) {
            subscribers[key[i]] = subscribers[key[i]] || [];

            subscribers[key[i]].push(fn);
        }
    }

    return {
        publish: publish,
        subscribe: subscribe
    }
}();