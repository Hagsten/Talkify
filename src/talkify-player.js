talkify = talkify || {};

talkify.TtsPlayer = function () {
    if (!talkify.config.remoteService.active) {
        throw "This player needs to communicate to a remote service. To enable this player please set flag talkify.config.remoteService.active to true.";
    }

    var me = this;
    var audioElement, timeupdater;

    this.currentContext = {
        item: null,
        positions: []
    };

    this.playbar = {
        instance: null
    };

    this.audioSource = {
        play: function () {
            audioElement.play();
        },
        pause: function () {
            audioElement.pause();
        },
        isPlaying: function () {
            return audioElement.duration > 0 && !audioElement.paused;
        },
        paused: function () { return audioElement.paused; },
        currentTime: function () { return audioElement.currentTime; },
        stop: function () {
            audioElement.pause();
            audioElement.currentTime = 0;
        },
        dispose: function () {
            if (timeupdater) {
                clearInterval(timeupdater);
            }

            var existingElement = document.getElementById("talkify-audio");

            if (existingElement) {
                existingElement.outerHTML = "";
            }

            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.play");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.pause");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.seek");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.volume");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.rate");

        }
    };

    talkify.BasePlayer.call(this, this.audioSource, this.playbar);

    function setupBindings() {
        audioElement.addEventListener("pause", onPause);
        audioElement.addEventListener("play", onPlay);
        audioElement.addEventListener("seeked", onSeek);
    }

    function onSeek() {
        talkify.messageHub.publish(me.correlationId + ".player.tts.seeked", this.currentTime);

        if (me.audioSource.paused() && me.audioSource.currentTime() > 0.1) {
            me.audioSource.play();
        }
    }

    function onPause() {
        if (timeupdater) {
            clearInterval(timeupdater);
        }

        talkify.messageHub.publish(me.correlationId + ".player.tts.pause");
    }

    function onPlay() {
        if (timeupdater) {
            clearInterval(timeupdater);
        }

        timeupdater = setInterval(function () {
            talkify.messageHub.publish(me.correlationId + ".player.tts.timeupdated", { currentTime: audioElement.currentTime, duration: audioElement.duration });
        }, 50);

        if (!me.currentContext.positions.length) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.play", { item: me.currentContext.item, positions: [], currentTime: me.audioSource.currentTime() });
            return;
        }

        if (me.audioSource.currentTime() > 0.1) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.resume", { currentTime: me.audioSource.currentTime() });
        } else {
            var interval = setInterval(function () {
                if (me.audioSource.currentTime() > 0) {
                    clearInterval(interval);

                    talkify.messageHub.publish(me.correlationId + ".player.tts.play", { item: me.currentContext.item, positions: me.currentContext.positions, currentTime: me.audioSource.currentTime() });
                }
            }, 20);
        }
    }

    function initialize() {
        if (timeupdater) {
            clearInterval(timeupdater);
        }

        audioElement = null;
        var existingElement = document.getElementById("talkify-audio");

        if (existingElement) {
            existingElement.outerHTML = "";
        }

        var mp3Source = document.createElement("source");
        var wavSource = document.createElement("source");
        audioElement = document.createElement("audio");

        audioElement.appendChild(mp3Source);
        audioElement.appendChild(wavSource);

        mp3Source.type = "audio/mpeg";
        wavSource.type = "audio/wav";
        audioElement.id = "talkify-audio";
        audioElement.controls = !talkify.config.ui.audioControls.enabled;
        audioElement.autoplay = false;

        document.body.appendChild(audioElement);

        var clonedAudio = audioElement.cloneNode(true);
        audioElement.parentNode.replaceChild(clonedAudio, audioElement);

        audioElement = clonedAudio;

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.play", function () { me.play(); });
        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.pause", function () { audioElement.pause(); });
        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.seek", function (position) {
            var pos = audioElement.duration * position;

            if (isNaN(audioElement.duration)) {
                return;
            }

            audioElement.currentTime = pos;
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.volume", function (volume) { audioElement.volume = volume / 10; });
        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.rate", function (rate) { me.settings.rate = rate; });

        if (me.playbar.instance) {
            me.playbar.instance
                .setMinRate(-5)
                .setMaxRate(5);
        }
    }

    function getPositions(requestId) {
        var p = new promise.promise.Promise();

        talkify.http.get(talkify.config.remoteService.speechBaseUrl + "/marks?id=" + requestId)
            .then(function (error, positions) {
                p.done(null, positions);
            });

        return p;
    };

    initialize.apply(this);

    this.playAudio = function (item) {
        talkify.messageHub.publish(me.correlationId + ".player.tts.loading", item);

        me.currentContext.item = item;
        me.currentContext.positions = [];

        audioElement.onloadeddata = null;
        audioElement.onended = null;

        var sources = audioElement.getElementsByTagName("source");

        var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));
        var voice = this.forcedVoice ? this.forcedVoice.name : "";

        var requestId = talkify.generateGuid();

        var audioUrl = talkify.config.remoteService.host + talkify.config.remoteService.speechBaseUrl + "?text=" + textToPlay + "&fallbackLanguage=" + this.settings.referenceLanguage.Language + "&voice=" + (voice) + "&rate=" + this.settings.rate + "&key=" + talkify.config.remoteService.apiKey;

        if (me.settings.useTextHighlight) {
            audioUrl += "&marksid=" + requestId;
        }

        sources[0].src = audioUrl + "&format=mp3";
        sources[1].src = audioUrl + "&format=wav";

        audioElement.load();

        audioElement.onloadeddata = function () {

            me.audioSource.pause();

            if (!me.settings.useTextHighlight) {
                talkify.messageHub.publish(me.correlationId + ".player.tts.loaded", me.currentContext.item);
                me.audioSource.play();
                return;
            }

            getPositions(requestId).then(function (error, positions) {
                me.currentContext.positions = positions || [];

                talkify.messageHub.publish(me.correlationId + ".player.tts.loaded", me.currentContext.item);
                me.audioSource.play();
            });
        };

        audioElement.onended = function () {
            talkify.messageHub.publish(me.correlationId + ".player.tts.ended", item);
        };
    };

    setupBindings();
};

talkify.TtsPlayer.prototype.constructor = talkify.TtsPlayer;