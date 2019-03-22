talkify = talkify || {};
talkify.BasePlayer = function (_audiosource, _playbar) {
    this.correlationId = talkify.generateGuid();
    this.audioSource = _audiosource;
    this.wordHighlighter = new talkify.wordHighlighter(this.correlationId);

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
        this.playbar.instance = talkify.playbar(null, this.correlationId);
    }

    talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.loaded", function (item) {
        item.isLoading = false;
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.ended", function (item) {
        item.isPlaying = false;
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".controlcenter.texthighlightoggled", function (enabled) {
        me.settings.useTextHighlight = enabled;
    });

    talkify.messageHub.publish(this.correlationId + ".player.*.ratechanged", me.settings.rate);

    this.withReferenceLanguage = function (refLang) {
        this.settings.referenceLanguage = refLang;

        return this;
    };

    this.enableTextHighlighting = function () {
        this.settings.useTextHighlight = true;

        talkify.messageHub.publish(this.correlationId + ".player.*.texthighlight.enabled");

        return this;
    };

    this.disableTextHighlighting = function () {
        this.settings.useTextHighlight = false;

        talkify.messageHub.publish(this.correlationId + ".player.*.texthighlight.disabled");

        return this;
    };

    this.setRate = function (r) {
        this.settings.rate = r;

        talkify.messageHub.publish(this.correlationId + ".player.*.ratechanged", r);

        return this;
    };

    this.subscribeTo = function (subscriptions) {
        talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.pause", subscriptions.onPause || function () { });
        talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.resume", subscriptions.onResume || function () { });
        talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.play", subscriptions.onPlay || function () { });
        talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.loaded", subscriptions.onItemLoaded || function () { });
        talkify.messageHub.subscribe("core-player", [this.correlationId + ".wordhighlighter.complete", this.correlationId + ".player.html5.utterancecomplete"], subscriptions.onItemFinished || function () { });
        talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.prepareplay", subscriptions.onBeforeItemPlaying || function () { });
        talkify.messageHub.subscribe("core-player", this.correlationId + ".controlcenter.texthighlightoggled", subscriptions.onTextHighligtChanged || function () { });

        return this;
    };

    this.playItem = function (item) {
        if (item && item.isPlaying) {
            if (this.audioSource.paused()) {
                this.audioSource.play();
            } else {
                this.audioSource.pause();
            }
        }

        talkify.messageHub.publish(this.correlationId + ".player.*.prepareplay", item);

        item.isLoading = true;
        item.isPlaying = true;
        item.element.classList.add("playing");

        this.playAudio(item);
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

        talkify.messageHub.subscribe("core-player.playText", this.correlationId + ".player.*.ended", function () {
            currentItem++;

            if (currentItem >= items.length) {
                talkify.messageHub.unsubscribe("core.playText", this.correlationId + ".player.*.ended");
                return;
            }

            this.playItem(items[currentItem]);
        });

        this.playItem(items[currentItem]);
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
        talkify.messageHub.publish(this.correlationId + ".player.tts.disposed");
        this.audioSource.stop();

        this.audioSource.dispose();
        this.wordHighlighter.dispose();

        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.loaded");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.ended");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".controlcenter.texthighlightoggled");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.pause");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.resume");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.play");
        talkify.messageHub.unsubscribe("core-player", [this.correlationId + ".wordhighlighter.complete", this.correlationId + ".player.html5.utterancecomplete"]);
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".player.*.prepareplay");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".controlcenter.texthighlightoggled");
    };

    this.forceLanguage = function (culture) {
        this.settings.lockedLanguage = culture;

        return this;
    };

    this.forceVoice = function (voice) {
        this.forcedVoice = voice !== undefined ? voice : null;

        this.settings.lockedLanguage = (voice && (voice.lang || voice.culture)) || this.settings.lockedLanguage;

        talkify.messageHub.publish(this.correlationId + ".player.*.voiceset", voice);

        return this;
    };
};