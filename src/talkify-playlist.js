function talkifyPlaylist() {

    var defaults = {
        useGui: false,
        useTextInteraction: false,
        domElements: [],
        rootSelector: "body",
        events: {
            onEnded: null
        }
    };

    var s = JSON.parse(JSON.stringify(defaults));

    var p = null;

    function isSupported() {
        var a = document.createElement("audio");

        return (typeof a.canPlayType === "function" && (a.canPlayType("audio/mpeg") !== "" || a.canPlayType("audio/wav") !== ""));
    }

    function implementation(_settings, player) {

        var textextractor = new TalkifyTextextractor();

        var playlist = {
            queue: [],
            currentlyPlaying: null,
            refrenceText: "",
            referenceLanguage: { Culture: '', Language: -1 }
        };

        var settings = _settings;
        var playerHasBeenReplaced = false;

        function reset() {
            playlist.queue = [];
            player.withReferenceLanguage({ Culture: '', Language: -1 });
            playlist.currentlyPlaying = null;
            playlist.refrenceText = "";
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

                //TODO: Call player.resetItem?
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

        function playItem(item) {
            var p = new promise.Promise();

            if (!playerHasBeenReplaced && item && item.isPlaying) {
                if (player.paused()) {
                    player.play();
                } else {
                    player.pause();
                }

                return p;
            }

            playerHasBeenReplaced = false;

            resetPlaybackStates();

            if (playlist.currentlyPlaying) {
                playlist.currentlyPlaying.element.html(playlist.currentlyPlaying.originalElement.html());
            }

            playlist.currentlyPlaying = item;

            p = player.playItem(item);

            return p;
        };

        function createItems(text, $element) { //TODO: jQuery-dependency
            var safeMaxQuerystringLength = 1000;

            var items = [];

            if (text.length > safeMaxQuerystringLength) {
                var breakAt = text.substr(0, safeMaxQuerystringLength).lastIndexOf('.'); //TODO: What about ckj characters?

                breakAt = breakAt > -1 ? breakAt : safeMaxQuerystringLength;

                var f = text.substr(0, breakAt);

                items.push(template(f, $element));

                items = items.concat(createItems(text.substr(breakAt, text.length - 1), $element));

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

        function play(item) {
            if (!item) {
                if (playlist.queue.length === 0) {
                    return;
                }

                playFromBeginning();

                return;
            }

            continueWithNext(item);
        }

        function pause() {
            player.pause();
        }

        function setupItemForUserInteraction(item) {
            item.element.css("cursor", "pointer")
                .addClass('talkify-highlight')
                .unbind('click.talkify')
                .bind('click.talkify', function () {
                    play(item);
                });
        }

        function initialize() {
            reset();

            if (!settings.domElements || settings.domElements.length === 0) {
                settings.domElements = textextractor.extract(settings.rootSelector);
            }

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

            if (settings.useTextInteraction) {
                for (var j = 0; j < playlist.queue.length; j++) {
                    var item = playlist.queue[j];

                    if (j > 0) {
                        var isSameAsPrevious = item.element.is(playlist.queue[j - 1].element);

                        if (isSameAsPrevious) {
                            continue;
                        }
                    }

                    setupItemForUserInteraction(item);
                }
            }
        }

        function continueWithNext(currentItem) {
            var next = function (completed) {

                if (completed) {
                    settings.events.onEnded();

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
            return talkifyHttp.get("/api/Language?text=" + playlist.refrenceText)
                .then(function (error, data) {
                    if (error) {
                        playlist.referenceLanguage = { Culture: '', Language: -1 };
                        player.withReferenceLanguage({ Culture: '', Language: -1 });

                        continueWithNext(playlist.queue[0]);

                        return;
                    }

                    playlist.referenceLanguage = data;
                    player.withReferenceLanguage(data);

                    continueWithNext(playlist.queue[0]);
                });
        }

        function playNext() {
            var p = new promise.Promise();

            var item = getNextItem();

            if (!item) {
                p.done("Completed");

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

                if (isSelectionAfterQueueItem) {
                    var queueItems = createItems(text, element);

                    insertAt(j, queueItems);

                    items = items.concat(queueItems);

                    break;
                }

                var shouldAddToBottom = j === playlist.queue.length - 1;

                if (shouldAddToBottom) {
                    var qItems = createItems(text, element);

                    push(qItems);

                    items = items.concat(qItems);

                    break;;
                }
            }

            return items;
        }

        function replayCurrent() {
            playlist.currentlyPlaying.isPlaying = false;
            play(playlist.currentlyPlaying);
        }

        initialize();

        return {
            getQueue: function () { return playlist.queue; },
            play: play,
            pause: pause,
            replayCurrent: replayCurrent,
            insert: insertElement,
            isPlaying: isPlaying,
            setPlayer: function (p) {
                player = p;
                player.withReferenceLanguage(playlist.referenceLanguage);
                playerHasBeenReplaced = true;
            }
        }
    }

    return {
        begin: function () {
            s = JSON.parse(JSON.stringify(defaults));
            p = null;

            return {
                withTextInteraction: function () {
                    s.useTextInteraction = true;

                    return this;
                },
                withTalkifyUi: function () {
                    s.useGui = true;

                    return this;
                },
                withRootSelector: function (rootSelector) {
                    s.rootSelector = rootSelector;

                    return this;
                },
                withElements: function (elements) {
                    s.domElements = elements;

                    return this;
                },
                usingPlayer: function (player) {
                    p = player;

                    return this;
                },
                subscribeTo: function (events) {
                    s.events.onEnded = events.onEnded || function () { };

                    return this;
                },
                build: function () {
                    if (!isSupported()) {
                        throw new Error("Not supported. The browser needs to support mp3 or wav HTML5 Audio.");
                    }

                    if (!p) {
                        throw new Error("A player must be provided. Please use the 'usingPlayer' method to provide one.");
                    }

                    s.events.onEnded = s.events.onEnded || function () { };

                    return new implementation(s, p);
                }
            }
        }

    };
};