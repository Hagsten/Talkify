talkify = talkify || {};
talkify.messageHub = function () {
    var subscribers = {};

    function publish(topic, message) {
        if (topic.indexOf("timeupdate") === -1) {
            talkify.log("Publishing", topic);
        }

        var topics = topic.split('.');
        var candidates = [];

        Object.keys(subscribers).forEach(function (subscriberKey) {
            if(subscriberKey === '*'){
                candidates.push(subscriberKey);
                return;
            }

            var s = subscriberKey.split('.');

            if (s.length != topics.length) {
                return;
            }

            var match = true;

            for (var i = 0; i < s.length; i++) {
                if (topics[i] === '*') {
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

        if (candidates.length === 0) {
            console.warn("No subscriber found", topic)
        }

        candidates.forEach(function (c) {
            subscribers[c].forEach(function (subscriber) {
                if (c.indexOf("timeupdate") === -1) {
                    talkify.log("Calling subscriber", subscriber, c, message);
                }

                subscriber.fn(message, topic);
            });
        })

    }

    function subscribe(key, topic, fn) {
        topic = Array.isArray(topic) ? topic : [topic];

        for (var i = 0; i < topic.length; i++) {
            subscribers[topic[i]] = subscribers[topic[i]] || [];

            subscribers[topic[i]].push({ key: key, fn: fn });
        }
    }

    function unsubscribe(key, topic) {
        topic = Array.isArray(topic) ? topic : [topic];

        talkify.log("Unsubscribing", key, topic);

        Object.keys(subscribers).filter(function (subscriberKey) {
            return topic.indexOf(subscriberKey) > -1 ;
        }).forEach(function (subscriberKey) {
            subscribers[subscriberKey] = subscribers[subscriberKey].filter(function (subscriber) {
                return subscriber.key !== key;
            });
        });
    }

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    }
}();