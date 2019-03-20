talkify = talkify || {};
talkify.BasePlayer = function (_audiosource, _playbar) {
    this.audioSource = _audiosource;
    this.wordHighlighter = new talkify.wordHighlighter();
    var me = this;

    this.settings = {
        useTextHighlight: false,
        referenceLanguage: { Culture: "", Language: -1 },
        lockedLanguage: null,
        rate: 1,
        useControls: false
    };

    this.playbar = _playbar;
    this.forcedVoice = null;

    if (talkify.config.ui.audioControls.enabled) {
        this.playbar.instance = talkify.playbar();
    }

    talkify.messageHub.subscribe("player.*.loaded", function(item){
        item.isLoading = false;
    });

    talkify.messageHub.subscribe("controlcenter.texthighlightoggled", function(enabled){
        me.settings.useTextHighlight = enabled;
    });

    talkify.messageHub.publish("player.*.ratechanged", me.settings.rate);

    this.withReferenceLanguage = function (refLang) {
        this.settings.referenceLanguage = refLang;

        return this;
    };

    this.enableTextHighlighting = function () {
        this.settings.useTextHighlight = true;

        talkify.messageHub.publish("player.*.texthighlight.enabled");

        return this;
    };

    this.disableTextHighlighting = function () {
        this.settings.useTextHighlight = false;

        talkify.messageHub.publish("player.*.texthighlight.disabled");

        return this;
    };

    this.setRate = function (r) {
        this.settings.rate = r;

        talkify.messageHub.publish("player.*.ratechanged", r);

        return this;
    };

    this.subscribeTo = function (subscriptions) {
        talkify.messageHub.subscribe("player.*.pause", subscriptions.onPause || function () { });
        talkify.messageHub.subscribe("player.*.resume", subscriptions.onResume || function () { });
        talkify.messageHub.subscribe("player.*.play", subscriptions.onPlay || function () { });
        talkify.messageHub.subscribe("player.*.loaded", subscriptions.onItemLoaded || function () { });
        talkify.messageHub.subscribe(["wordhighlighter.complete", "player.html5.utterancecomplete"], subscriptions.onItemFinished || function () { });
        talkify.messageHub.subscribe("player.*.prepareplay", subscriptions.onBeforeItemPlaying || function () { });
        talkify.messageHub.subscribe("controlcenter.texthighlightoggled", subscriptions.onTextHighligtChanged || function () { });

        return this;
    };

    this.playItem = function (item) {
        var p = new promise.Promise();

        if (item && item.isPlaying) {
            if (this.audioSource.paused()) {
                this.audioSource.play();
            } else {
                this.audioSource.pause();
            }

            return p;
        }

        talkify.messageHub.publish("player.*.prepareplay", item);
        // this.events.onBeforeItemPlaying(item);

        var me = this;

        item.isLoading = true;
        item.isPlaying = true;
        item.element.classList.add("playing");

        this.playAudio(item, function () {
            item.isPlaying = false;
            p.done();
        });

        return p;
    };

    this.createItems = function (text) {
        var safeMaxQuerystringLength = 1000;

        var items = [];

        //TODO: Smart split, should really split at the first end of sentence (.) that is < safeLength
        if (text.length > safeMaxQuerystringLength) {
            var f = text.substr(0, safeMaxQuerystringLength);

            items.push(template(f));

            items = items.concat(this.createItems(text.substr(safeMaxQuerystringLength, text.length - 1)));

            return items;
        }

        items.push(template(text));

        return items;

        function template(t) {
            //Null-objects
            var element = document.createElement("span");
            var clone = element.cloneNode(true);

            return {
                text: t,
                preview: t.substr(0, 40),
                element: element,
                originalElement: clone,
                isPlaying: false,
                isLoading: false
            };
        }
    };

    this.playText = function (text) {
        if (!text) {
            return;
        }

        var items = this.createItems(text);

        var currentItem = 0;

        var next = function () {
            currentItem++;

            if (currentItem >= items.length) {
                return;
            }

            this.playItem(items[currentItem])
                .then(next);
        };

        this.playItem(items[currentItem])
            .then(next);
    };

    this.paused = function () {
        return this.audioSource.paused();
    };

    this.isPlaying = function () {
        return this.audioSource.isPlaying();
    };

    this.play = function () {
        this.audioSource.play();
    };

    this.pause = function () {
        this.audioSource.pause();
        var me = this;

        if (!me.audioSource.paused() && me.audioSource.cancel) {
            me.audioSource.cancel(true);
        }
    };

    this.dispose = function () {
        talkify.messageHub.publish("player.tts.disposed");
        //this.wordHighlighter.cancel();
        this.audioSource.stop();
        // this.internalEvents.onStop();

        // this.mutateControls(function (c) {
        //     c.dispose();
        // });

        this.audioSource.dispose();
    };

    this.forceLanguage = function (culture) {
        this.settings.lockedLanguage = culture;

        return this;
    };

    this.forceVoice = function (voice) {
        this.forcedVoice = voice !== undefined ? voice : null;

        this.settings.lockedLanguage = (voice && (voice.lang || voice.culture)) || this.settings.lockedLanguage;

        talkify.messageHub.publish("player.*.voiceset", voice);

        return this;
    };
};