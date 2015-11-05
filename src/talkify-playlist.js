function talkifyPlaylist(ajax) {

    var s = {
        useTextHighlight: false,
        useGui: false,
        domElements: []
    };

    var e = {
        onBeforeItemPlaying: function() {},
        onSentenceComplete: function() {}
    };

    function isSupported() {
        var a = document.createElement("audio");

        return (typeof a.canPlayType === "function" && (a.canPlayType("audio/mpeg") !== "" || a.canPlayType("audio/wav") !== ""));
    }

    function implementation(setting, event) {
        var id = generateGuid();

        var playlist = {
            queue: [],
            referenceLanguage: -1,
            currentlyPlaying: null,
            refrenceText: ""
        };

        var settings = setting;
        var events = event;

        var internalEvents = {
            onPause: function() { talkifyWordHighlighter.pause(); },
            onPlay: function() { talkifyWordHighlighter.resume(); }
        }

        var audioElement;

        function reset() {
            playlist.queue = [];
            playlist.referenceLanguage = -1;
            playlist.currentlyPlaying = null;
        }

        function generateGuid() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function insertAt(index, items) {
            playlist.queue = playlist.queue.slice(0, index)
                .concat(items)
                .concat(playlist.queue.slice(index));
        }

        function push(items) {
            playlist.queue = playlist.queue.concat(items);
        }

        function resetPlaybackStates() {
            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                item.isPlaying = false;
                item.isLoading = false;
                item.element.removeClass("playing");
            }
        };

        function isPlaying() {
            for (var i = 0; i < playlist.queue.length; i++) {
                if (playlist.queue[i].isPlaying) {
                    return true;
                }
            }

            return false;
        }

        function domElementExistsInQueue($element) {
            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                if (!item) {
                    continue;
                }

                if ($element.is(item.element)) {
                    return true;
                }
            }

            return false;
        }

        var playAudio = function(textToPlay, onEnded) {
            var p = new promise.Promise();

            var sources = audioElement.getElementsByTagName("source");

            sources[0].src = talkifyConfig.host + "/api/Speak?format=mp3&text=" + textToPlay + "&refLang=" + playlist.referenceLanguage + "&id=" + id;
            sources[1].src = talkifyConfig.host + "/api/Speak?format=wav&text=" + textToPlay + "&refLang=" + playlist.referenceLanguage + "&id=" + id;

            audioElement.load();

            //TODO: remove jquery dependency
            $(audioElement)
                .unbind("loadeddata")
                .bind("loadeddata", function() {
                    audioElement.pause();

                    ajax.get("/api/Speak/GetPositions?id=" + id)
                        .then(function(error, positions) {
                            talkifyWordHighlighter
                                .start(playlist.currentlyPlaying, positions)
                                .then(function(item) {
                                    events.onSentenceComplete(item);
                                });

                            p.done();
                            audioElement.play();
                        });
                    //.finally(function() {
                    //    p.done();
                    //    audioElement.play();
                    //});
                })
                .unbind("ended.justForUniqueness")
                .bind("ended.justForUniqueness", onEnded || function() {});

            return p;
        };

        var loadItemForPlayback = function(item) {
            playlist.currentlyPlaying = item;

            var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));

            item.isLoading = true;
            item.isPlaying = true;
            item.element.addClass("playing");

            playAudio(textToPlay, function() { item.isPlaying = false; })
                .then(function() {
                    item.isLoading = false;
                });
        };

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

            resetPlaybackStates();

            if (playlist.currentlyPlaying) {
                playlist.currentlyPlaying.element.html(playlist.currentlyPlaying.originalElement.html());
            }

            loadItemForPlayback(item);

            $(audioElement).unbind("ended").bind("ended", function() {
                p.done();
            });

            return p;
        };

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
                var outerHtml = $el.length > 0 ? $($el[0].outerHTML) : "";

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

        function playText(text) {
            //TODO: Okay, we cannot hook up to the regular pipeline (we don't need text highlighing and such), this is afterall a plain text player. Maybe it should not even be a part of the playlist?
            var items = createItems(text, $());

            var currentItem = 0;

            var next = function() {
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

        function initialize() {
            reset();

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

            playlist.refrenceText = "";

            for (var i = 0; i < settings.domElements.length; i++) {
                var text;
                var element = $();

                if (typeof settings.domElements[i] === "string") {
                    text = settings.domElements[i];
                } else {
                    element = $(settings.domElements[i]);
                    text = element.text().trim();
                }

                if (text === "") {
                    continue;
                }

                push(createItems(text, element));

                if (text.length > playlist.refrenceText.length) {
                    playlist.refrenceText = text;
                }
            }
        }

        function continueWithNext(currentItem) {
            var next = function(error) {
                if (error) {
                    return;
                }

                playNext().then(next);
            };

            playItem(currentItem).then(next);
        }

        function getNextItem() {
            var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

            if (currentQueuePosition === playlist.queue.length - 1) {
                return null;
            }

            return playlist.queue[currentQueuePosition + 1];
        }

        function playFromBeginning() {
            return ajax.get("/api/Language?text=" + playlist.refrenceText)
                .then(function(error, data) {
                    if (error) {
                        playlist.referenceLanguage = -1;

                        var itemToPlay = playlist.queue[0];

                        continueWithNext(itemToPlay);

                        return;
                    }

                    playlist.referenceLanguage = data;

                    var itemToPlay = playlist.queue[0];

                    continueWithNext(itemToPlay);
                });
            //.error(function() {
            //    playlist.referenceLanguage = -1;

            //    var itemToPlay = playlist.queue[0];

            //    continueWithNext(itemToPlay);
            //});
        }

        function play(item) {
            if (!item) {
                playFromBeginning();

                return;
            }

            continueWithNext(item);
        }

        function playNext() {
            var p = new promise.Promise();

            var item = getNextItem();

            if (!item) {
                p.done("error");

                return p;
            }

            return playItem(item);
        }

        function insertElement(element) {
            var items = [];

            var text = element.text();

            if (text.trim() === "") {
                return items;
            }

            if (domElementExistsInQueue(element)) {
                return items;
            }

            var documentPositionFollowing = 4;

            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                var isSelectionAfterQueueItem = element[0].compareDocumentPosition(item.element[0]) == documentPositionFollowing;

                var queueItems = createItems(text, element);

                if (isSelectionAfterQueueItem) {
                    insertAt(j, queueItems);

                    items = items.concat(queueItems);

                    break;
                }

                var shouldAddToBottom = j == playlist.queue.length - 1;

                if (shouldAddToBottom) {
                    push(queueItems);

                    items = items.concat(queueItems);
                }
            }

            return items;
        }

        function setupBindings() {
            audioElement.removeEventListener("pause", internalEvents.onPause);
            audioElement.addEventListener("pause", internalEvents.onPause);

            audioElement.removeEventListener("play", internalEvents.onPlay);
            audioElement.addEventListener("play", internalEvents.onPlay);
        }

        initialize();

        return {
            getQueue: function() { return playlist.queue; },
            play: play,
            playText: playText,
            pause: audioElement.pause,
            insert: insertElement,
            isPlaying: isPlaying,
        }
    }

    return {
        withTextHighlighting: function() {
            s.useTextHighlight = true;

            return this;
        },
        withTalkifyUi: function() {
            s.useGui = true;

            return this;
        },
        withElements: function(elements) {
            s.domElements = elements;

            return this;
        },
        subscribeTo: function(subscriptions) {
            e.onBeforeItemPlaying = subscriptions.onBeforeItemPlaying || function() {};
            e.onSentenceComplete = subscriptions.onItemFinished || function() {};

            return this;
        },
        build: function() {
            if (!isSupported()) {
                throw new Error("Not supported. The browser needs to support mp3 or wav HTML5 Audio.");
            }

            return new implementation(s, e);
        }
    };
};

