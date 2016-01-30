function TalkifyPlayer() {
    var audioElement;
    var wordHighlighter = new TalkifyWordHighlighter();
    var id = generateGuid();

    var settings = {
        useTextHighlight: false,
        referenceLanguage: -1
    };

    var events = {
        onBeforeItemPlaying: function () { },
        onSentenceComplete: function () { }
    };

    var internalEvents = {
        onPause: function () { wordHighlighter.pause(); },
        onPlay: function () { wordHighlighter.resume(); }
    }

    function createItems(text, $element) { //TODO: jQuery-dependency
        var safeMaxQuerystringLength = 1000;

        var items = [];

        //TODO: Smart split, should really split at the first end of sentence (.) that is < safeLength
        if (text.length > safeMaxQuerystringLength) {
            var f = text.substr(0, safeMaxQuerystringLength);

            items.push(template(f, $element));

            items = items.concat(createItems(text.substr(safeMaxQuerystringLength, text.length - 1), $element));

            return items;
        }

        items.push(template(text, $element));

        return items;

        function template(t, $el) {
            var outerHtml = $el.length > 0 ? $($el[0].outerHTML) : $();

            return {
                text: t,
                preview: t.substr(0, 40),
                element: $el,
                originalElement: outerHtml,
                isPlaying: false,
                isLoading: false
            };
        }
    }

    var playAudio = function (item, onEnded) {
        var p = new promise.Promise();

        var sources = audioElement.getElementsByTagName("source");

        var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));

        sources[0].src = talkifyConfig.host + "/api/Speak?format=mp3&text=" + textToPlay + "&refLang=" + settings.referenceLanguage + "&id=" + id;
        sources[1].src = talkifyConfig.host + "/api/Speak?format=wav&text=" + textToPlay + "&refLang=" + settings.referenceLanguage + "&id=" + id;

        audioElement.load();

        //TODO: remove jquery dependency
        $(audioElement)
            .unbind("loadeddata")
            .bind("loadeddata", function () {
                audioElement.pause();

                if (!settings.useTextHighlight) {
                    p.done();
                    audioElement.play();
                    return;
                }

                talkifyHttp.get("/api/Speak/GetPositions?id=" + id)
                    .then(function (error, positions) {
                        wordHighlighter
                            .start(item, positions)
                            .then(function (completedItem) {
                                events.onSentenceComplete(completedItem);
                            });

                        p.done();
                        audioElement.play();
                    });
            })
            .unbind("ended.justForUniqueness")
            .bind("ended.justForUniqueness", onEnded || function () { });

        return p;
    };

    var loadItemForPlayback = function (item) {
        item.isLoading = true;
        item.isPlaying = true;
        item.element.addClass("playing");

        playAudio(item, function () { item.isPlaying = false; })
            .then(function () {
                item.isLoading = false;
            });
    };

    function generateGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function playItem(item) {
        var p = new promise.Promise();

        if (item && item.isPlaying) {
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }

            return p;
        }

        events.onBeforeItemPlaying(item);

        loadItemForPlayback(item);

        $(audioElement).unbind("ended").bind("ended", function () {
            p.done();
        });

        return p;
    };

    function playText(text) {
        var items = createItems(text, $());

        var currentItem = 0;

        var next = function () {
            currentItem++;

            if (currentItem >= items.length) {
                return;
            }

            playItem(items[currentItem])
                .then(next);
        };

        playItem(items[currentItem])
            .then(next);
    }

    function setupBindings() {
        audioElement.removeEventListener("pause", internalEvents.onPause);
        audioElement.addEventListener("pause", internalEvents.onPause);

        audioElement.removeEventListener("play", internalEvents.onPlay);
        audioElement.addEventListener("play", internalEvents.onPlay);
    }

    function initialize() {
        audioElement = document.getElementById("talkify-audio");

        if (!audioElement) {
            var mp3Source = document.createElement("source");
            var wavSource = document.createElement("source");
            audioElement = document.createElement("audio");

            audioElement.appendChild(mp3Source);
            audioElement.appendChild(wavSource);

            mp3Source.type = "audio/mpeg";
            wavSource.type = "audio/wav";
            audioElement.id = "talkify-audio";
            audioElement.controls = true;
            audioElement.autoplay = true;

            document.body.appendChild(audioElement);
        }

        setupBindings();
    }

    initialize();

    return {
        playItem: playItem,
        playText: playText,
        pause: function () {
            audioElement.pause();
        },
        play: function() {
            audioElement.play();
        },
        paused: function () { return audioElement.paused; },
        withReferenceLanguage: function(refLang) {
            settings.referenceLanguage = refLang;

            return this;
        },
        withTextHighlighting: function () {
            settings.useTextHighlight = true;

            return this;
        },
        subscribeTo: function (subscriptions) {
            events.onBeforeItemPlaying = subscriptions.onBeforeItemPlaying || function () { };
            events.onSentenceComplete = subscriptions.onItemFinished || function () { };

            return this;
        }
    }
}