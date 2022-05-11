talkify = talkify || {};
talkify.playlist = function () {
    var defaults = {
        useGui: false,
        useTextInteraction: false,
        domElements: null,
        exclusions: [],
        rootSelector: "body",
        events: {
            onEnded: null,
            onVoiceCommandListeningStarted: null,
            onVoiceCommandListeningEnded: null
        }
    };

    var s = JSON.parse(JSON.stringify(defaults));

    var p = null;

    function isSupported() {
        var a = document.createElement("audio");

        return (typeof a.canPlayType === "function" && (a.canPlayType("audio/mpeg") !== "" || a.canPlayType("audio/wav") !== ""));
    }

    function implementation(_settings, player) {
        var textextractor = new talkify.textextractor();

        var playlist = {
            queue: [],
            currentlyPlaying: null,
            refrenceText: "",
            referenceLanguage: { Culture: '', Language: -1 }
        };

        var settings = _settings;
        var playerHasBeenReplaced = false;

        var commands = [
            new talkify.KeyboardCommands(talkify.config.keyboardCommands),
            new talkify.SpeechCommands(talkify.config.voiceCommands)
        ];

        var voiceCommands = commands[1];

        for (var k = 0; k < commands.length; k++) {
            commands[k].onNext(playNext);
            commands[k].onPrevious(playPrevious);
            commands[k].onPlayPause(function () {
                if (player.paused()) {
                    player.play();
                } else {
                    pause();
                }
            });
        }

        voiceCommands.onListeningStarted(settings.events.onVoiceCommandListeningStarted);
        voiceCommands.onListeningEnded(settings.events.onVoiceCommandListeningEnded);

        setupHubSubscribers();

        function setupHubSubscribers() {
            talkify.messageHub.subscribe("playlist", player.correlationId + ".player.*.ended", function (endedItem) {
                if (playlist.queue.indexOf(endedItem) === -1) {
                    return;
                }

                var item = getNextItem();

                if (!item) {
                    settings.events.onEnded();
                    resetPlaybackStates();
                    return;
                }

                playItem(item);
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".player.*.unplayable", function () {
                if (playlist.currentlyPlaying) {
                    playItem(playlist.currentlyPlaying);
                    return;
                }

                playFromBeginning();
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled", function (enabled) {
                if (enabled) {
                    enableTextInteraction();
                } else {
                    disableTextInteraction();
                }
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.playnext", playNext);
            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.playprevious", playPrevious);
            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.download", downloadAudio);
        }

        function downloadAudio() {
            if (!player) {
                return;
            }

            if (player.downloadAudio) {
                var separators = ['\.', '\?', '!', '。'];

                var text = playlist.queue.map(function (x) {
                    if (separators.indexOf(x.text.trim().substr(-1)) !== -1) {
                        return x.text;
                    }

                    return x.text + ".";
                });

                player.downloadAudio(text.join(" "));
            }
        }

        function playNext() {
            var item = getNextItem();

            if (!item) {
                return;
            }

            playItem(item);
        }

        function playPrevious() {
            var item = getPreviousItem();

            if (!item) {
                return;
            }

            playItem(item);
        }

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
                item.element.classList.remove("playing");
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

        function domElementExistsInQueue(element) { //TODO: might need to look at construct as <a><h3></h3></a> and whether "a" is "h3" since it is just a wrapper
            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                if (!item) {
                    continue;
                }

                if (element === item.element) {
                    return true;
                }
            }

            return false;
        }

        function playItem(item) {
            if (!playerHasBeenReplaced && item && item.isPlaying) {
                if (player.paused()) {
                    player.play();
                } else {
                    player.pause();
                }
            }

            playerHasBeenReplaced = false;

            resetPlaybackStates();

            if (playlist.currentlyPlaying) {
                playlist.currentlyPlaying.element.innerHTML = playlist.currentlyPlaying.originalElement.innerHTML;
            }

            playlist.currentlyPlaying = item;

            var previous = getPreviousItem();
            var next = getNextItem();

            talkify.messageHub.publish(player.correlationId + ".playlist.playing", { isFirst: !previous, isLast: !next });

            p = player.playItem(item);
        };

        function createItems(text, ssml, element) {
            var safeMaxQuerystringLength = window.talkify.config.maximumTextLength || 1000;

            var items = [];

            if (text.length > safeMaxQuerystringLength) {
                var chuncks = getSafeTextChunks(text, safeMaxQuerystringLength);

                element.innerHTML = '';

                for (var i = 0; i < chuncks.length; i++) {
                    var p = document.createElement("p");
                    p.textContent = chuncks[i];

                    element.appendChild(p);

                    items = items.concat(template(chuncks[i], null, p));
                }

                return items;
            }

            items = items.concat(template(text, ssml, element));

            return items;

            function template(t, s, el) {
                el = el || document.createElement("span");
                var clone = el.cloneNode(true);

                var wordbreakms = el.getAttribute("data-talkify-wordbreakms");
                var whisper = el.getAttribute("data-talkify-whisper");
                var phonation = el.getAttribute("data-talkify-phonation");
                var voice = el.getAttribute("data-talkify-voice") || null;
                var pitch = el.getAttribute("data-talkify-pitch") || null;
                var rate = el.getAttribute("data-talkify-rate") || null;
                var prefix = el.getAttribute("data-talkify-prefix") || null;

                var response = [];

                var text = prefix ? prefix + ": " + t : t;
                var ssml = prefix ? prefix + ": " + s : s;

                response.push({
                    text: text,
                    ssml: ssml,
                    prefix: prefix,
                    preview: t.substr(0, 40),
                    element: el,
                    originalElement: clone,
                    isPlaying: false,
                    isLoading: false,
                    wordbreakms: wordbreakms ? parseInt(wordbreakms) : null,
                    whisper: whisper ? whisper === "true" : null,
                    soft: phonation ? phonation === "soft" : null,
                    voice: voice,
                    pitch: pitch ? parseInt(pitch) : null,
                    rate: rate ? parseInt(rate) : null
                });

                return response;
            }
        }

        function getSafeTextChunks(text, safeMaxQuerystringLength) {
            var chuncks = [];
            var remaining = text;

            var chunck = getNextChunck(text, safeMaxQuerystringLength);
            chuncks.push(chunck);

            while (chunck) {
                remaining = remaining.replace(chunck, "");

                chunck = getNextChunck(remaining, safeMaxQuerystringLength);

                if (chunck) {
                    chuncks.push(chunck);
                }
            }

            return chuncks;
        }

        function getNextChunck(text, safeMaxQuerystringLength) {
            if (!text) {
                return null;
            }

            if (text.length < safeMaxQuerystringLength) {
                return text;
            }

            var breakAt = text.substr(0, safeMaxQuerystringLength).lastIndexOf('.');
            breakAt = breakAt > -1 ? breakAt : text.substr(0, safeMaxQuerystringLength).lastIndexOf('。');
            breakAt = breakAt > -1 ? breakAt : safeMaxQuerystringLength;

            return text.substr(0, breakAt + 1);
        }

        function play(item) {
            if (!item) {
                if (playlist.queue.length === 0) {
                    return;
                }

                playFromBeginning();

                return;
            }

            playItem(item);
        }

        function pause() {
            player.pause();
        }

        function setupItemForUserInteraction(item) {
            item.element.style.cursor = "pointer";
            item.element.classList.add("talkify-highlight");

            removeEventListeners("click", item.element);
            addEventListener("click", item.element, textInteractionEventListener);

            function textInteractionEventListener() {
                play(item);
            }
        }

        function removeUserInteractionForItem(item) {
            item.element.style.cursor = "inherit";
            item.element.classList.remove("talkify-highlight");

            removeEventListeners("click", item.element);
        }

        function markTables() {
            if (!settings.tableConfig) {
                return;
            }

            talkify.tableReader.markTables(settings.tableConfig);
        }

        function extractTables() {
            if (!settings.tableConfig) {
                return [];
            }

            return Array.from(document.querySelectorAll('.talkify-tts-table'));
        }

        function initialize() {
            reset();

            markTables();

            if (!settings.domElements) {
                settings.domElements = textextractor.extract(settings.rootSelector, settings.exclusions);
            }

            for (var i = 0; i < settings.domElements.length; i++) {
                var text, ssml;
                var element = null;

                if (typeof settings.domElements[i] === "string") {
                    text = settings.domElements[i];
                } else {
                    element = settings.domElements[i];

                    ssml = convertToSsml(element);

                    text = getTextOfElement(element);
                }

                if (text === "") {
                    continue;
                }

                push(createItems(text, ssml, element));

                if (text.length > playlist.refrenceText.length) {
                    playlist.refrenceText = text;
                }
            }

            var tables = extractTables();            

            for (var t = 0; t < tables.length; t++) {
                var cells = Array.from(tables[t].querySelectorAll(".talkify-tts-tablecell"));

                insertChunckOfElements(cells);
            }

            if (settings.useTextInteraction) {
                for (var j = 0; j < playlist.queue.length; j++) {
                    var item = playlist.queue[j];

                    if (j > 0) {
                        var isSameAsPrevious = item.element === playlist.queue[j - 1].element;

                        if (isSameAsPrevious) {
                            continue;
                        }
                    }

                    setupItemForUserInteraction(item);
                }
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.loaded");

            if (settings.useTextInteraction) {
                talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.enabled");
            } else {
                talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.disabled");
            }
        }

        function getTextOfElement(element){
            var clone = element.cloneNode(true);

            var matches = clone.querySelectorAll('[data-talkify-read-as-lowercase="true"]');

            if(matches.length === 0 && clone.getAttribute('data-talkify-read-as-lowercase') === "true"){
                matches.push(clone);
            }

            matches.forEach(function(e) {
                e.innerText = e.innerText.toLowerCase();
            });

            return clone.innerText.trim();
        }

        function convertToSsml(element) {
            if (!talkify.config.useSsml) {
                return null;
            }

            var ssmlMappings = {
                h1: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                h2: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                h3: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                b: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                strong: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                em: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                i: {
                    start: '###emphasis level="reduced">',
                    end: '###/emphasis>',
                    trim: false
                },
                br: {
                    start: '###break strength="x-strong">###/break>',
                    end: '',
                    trim: true
                }
            };

            var htmlEntities = {};
            htmlEntities["&nbsp;"] = " ";
            htmlEntities["&lt;"] = "<";
            htmlEntities["&gt;"] = ">";
            htmlEntities["&qout;"] = "\"";
            htmlEntities["&apos;"] = "'";
            htmlEntities["&amp;"] = "&";

            var ssml = element.innerHTML.replace(/ +/g, " ").replace(/(\r\n|\n|\r)/gm, "").trim();

            for (var key in htmlEntities) {
                ssml = ssml.replace(new RegExp(key, 'g'), htmlEntities[key]);
            }

            for (var key in ssmlMappings) {
                var mapping = ssmlMappings[key];

                var startTagMatches = ssml.match(new RegExp('<' + key + '+(>|.*?[^?]>)', 'gi')) || [];

                for (var j = 0; j < startTagMatches.length; j++) {
                    if (startTagMatches[j] !== '<' + key + '>' && startTagMatches[j].indexOf('<' + key + ' ') !== 0) {
                        continue;
                    }

                    ssml = ssml.replace(startTagMatches[j], mapping.start);

                    if (mapping.trim) {
                        ssml = ssml.split(mapping.start).map(function (x) { return x.trim() }).join(mapping.start);
                    }
                }

                ssml = ssml.split('</' + key + '>').map(function (x, i) { return mapping.trim ? x.trim() : x; }).join(mapping.end);
            }

            ssml = ssml.replace(/<[^>]*>?/gm, ''); //removes html-tags
            ssml = ssml.replace(/\s+/g, ' '); //removes multiple whitespaces
            ssml = ssml.split('###').join('<');

            return ssml;
        }

        function getNextItem() {
            var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

            if (currentQueuePosition === playlist.queue.length - 1) {
                return null;
            }

            return playlist.queue[currentQueuePosition + 1];
        }

        function getPreviousItem() {
            var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

            if (currentQueuePosition === 0) {
                return null;
            }

            return playlist.queue[currentQueuePosition - 1];
        }

        function playFromBeginning() {
            if (!talkify.config.remoteService.active || !hasTalkifyPlayer()) {
                onComplete({ Cultures: [], Language: -1 });

                return;
            }

            var text = playlist.refrenceText.length <= 1000 ? playlist.refrenceText : playlist.refrenceText.substr(0, 1000);

            talkify.http.get(talkify.config.remoteService.languageBaseUrl + "/detect?text=" + text)
                .then(function (data) {
                    onComplete(data);
                })
                .catch(function(){
                    onComplete({ Cultures: [], Language: -1 });
                });

            function onComplete(refLang) {
                playlist.referenceLanguage = { Culture: refLang.Cultures[0], Language: refLang.Language };
                player.withReferenceLanguage(playlist.referenceLanguage);

                playItem(playlist.queue[0]);
            }
        }

        function hasTalkifyPlayer(voice) {
            return player instanceof talkify.TtsPlayer;
        }


        function insertChunckOfElements(elements) {
            if (!elements || elements.length === 0) {
                return;
            }

            if (!playlist.queue.length) {
                playlist.queue = elements.map(function (x) {
                    var text = getTextOfElement(x.innerText);
                    var ssml = convertToSsml(x);

                    return createItems(text, ssml, x);
                }).flat();

                return;
            }

            var baseline = elements[0];
            var documentPositionFollowing = 4;

            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                var isSelectionAfterQueueItem = baseline.compareDocumentPosition(item.element) == documentPositionFollowing;
                var shouldAddToBottom = j === playlist.queue.length - 1;

                if (isSelectionAfterQueueItem || shouldAddToBottom) {
                    var queueItems = elements.map(function (x) {
                        var text = getTextOfElement(x);
                        var ssml = convertToSsml(x);

                        return createItems(text, ssml, x);
                    }).flat();

                    var insertAtIndex = isSelectionAfterQueueItem ? j : j + 1;

                    insertAt(insertAtIndex, queueItems);

                    return;
                }
            }
        }

        function insertElement(element) {
            if (!element) {
                return [];
            }

            var items = [];

            var text = element.innerText;

            if (text.trim() === "") {
                return items;
            }

            if (domElementExistsInQueue(element)) {
                return items;
            }

            var documentPositionFollowing = 4;

            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                var isSelectionAfterQueueItem = element.compareDocumentPosition(item.element) == documentPositionFollowing;

                if (isSelectionAfterQueueItem) {
                    var queueItems = createItems(text, null, element);

                    insertAt(j, queueItems);

                    items = items.concat(queueItems);

                    break;
                }

                var shouldAddToBottom = j === playlist.queue.length - 1;

                if (shouldAddToBottom) {
                    var qItems = createItems(text, null, element);

                    push(qItems);

                    items = items.concat(qItems);

                    break;
                }
            }

            return items;
        }

        function replayCurrent() {
            if (!playlist.currentlyPlaying) {
                return;
            }

            playlist.currentlyPlaying.isPlaying = false;
            play(playlist.currentlyPlaying);
        }

        //TODO: Extract and reuse?
        function removeEventListeners(eventType, element) {
            if (!element.trackedEvents || !element.trackedEvents[eventType]) {
                return;
            }

            for (var i = 0; i < element.trackedEvents[eventType].length; i++) {
                element.removeEventListener(eventType, element.trackedEvents[eventType][i]);
            }
        }

        function addEventListener(eventType, element, listener) {
            if (!element.trackedEvents) {
                element.trackedEvents = [];
            }

            if (!element.trackedEvents[eventType]) {
                element.trackedEvents[eventType] = [];
            }

            element.trackedEvents[eventType].push(listener);
            element.addEventListener(eventType, listener);
        }

        function enableTextInteraction() {
            settings.useTextInteraction = true;

            for (var i = 0; i < playlist.queue.length; i++) {
                setupItemForUserInteraction(playlist.queue[i]);
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.enabled");
        }

        function disableTextInteraction() {
            settings.useTextInteraction = false;

            for (var i = 0; i < playlist.queue.length; i++) {
                removeUserInteractionForItem(playlist.queue[i]);
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.disabled");
        }

        initialize();

        return {
            getQueue: function () { return playlist.queue; },
            play: play,
            pause: pause,
            replayCurrent: replayCurrent,
            insert: insertElement,
            isPlaying: isPlaying,
            enableTextInteraction: enableTextInteraction,
            disableTextInteraction: disableTextInteraction,
            setPlayer: function (p) {
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.*.ended");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.tts.unplayable");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playnext");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playprevious");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.download");

                player = p;
                player.withReferenceLanguage(playlist.referenceLanguage);
                playerHasBeenReplaced = true;

                setupHubSubscribers();

                replayCurrent();
            },
            dispose: function () {
                resetPlaybackStates();

                for (var i = 0; i < playlist.queue.length; i++) {
                    var item = playlist.queue[i];

                    removeUserInteractionForItem(item);
                }

                for (var i = 0; i < commands.length; i++) {
                    commands[i].dispose();
                }

                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.*.ended");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.tts.unplayable");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playnext");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playprevious");
            },
            startListeningToVoiceCommands: function () {
                voiceCommands.start();
            },
            stopListeningToVoiceCommands: function () {
                voiceCommands.stop();
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
                excludeElements: function (elementsSelectors) {
                    s.exclusions = elementsSelectors;

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
                withTables: function (tableConfig) {
                    s.tableConfig = tableConfig;

                    return this;
                },
                usingPlayer: function (player) {
                    p = player;

                    return this;
                },
                subscribeTo: function (events) {
                    s.events.onEnded = events.onEnded || function () { };
                    s.events.onVoiceCommandListeningStarted = events.onVoiceCommandListeningStarted || function () { };
                    s.events.onVoiceCommandListeningEnded = events.onVoiceCommandListeningEnded || function () { };


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
                    s.events.onVoiceCommandListeningStarted = s.events.onVoiceCommandListeningStarted || function () { };
                    s.events.onVoiceCommandListeningEnded = s.events.onVoiceCommandListeningEnded || function () { };

                    return new implementation(s, p);
                }
            }
        }

    };
};