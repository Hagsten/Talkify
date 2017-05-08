talkify = talkify || {};

talkify.TtsPlayer = function () {
    if (!talkify.config.useRemoteServices) {
        throw "This player needs to communicate to a remote service. To enable this player please set flag talkify.config.useRemoteServices to true.";
    }

    var me = this;
    var audioElement;

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
            var existingElement = document.getElementById("talkify-audio");

            if (existingElement) {
                existingElement.outerHTML = "";
            }
        }
    };

    talkify.BasePlayer.call(this, this.audioSource, this.playbar);

    function setupBindings() {
        audioElement.addEventListener("pause", onPause);
        audioElement.addEventListener("play", onPlay);
    }

    function onPause() {
        me.internalEvents.onPause();
        me.wordHighlighter.pause();
    }

    function onPlay() {
        me.internalEvents.onPlay();

        if (!me.currentContext.positions.length) {
            return;
        }

        if (me.audioSource.currentTime() > 0.1) {
            me.wordHighlighter.resume();
        } else {
            var interval = setInterval(function () {
                if (me.audioSource.currentTime() > 0) {
                    clearInterval(interval);

                    me.wordHighlighter
                        .start(me.currentContext.item, me.currentContext.positions)
                        .then(function (completedItem) {
                            me.events.onSentenceComplete(completedItem);
                        });
                }
            }, 20);
        }
    }

    function initialize() {
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

        me.mutateControls(function () {
            me.playbar.instance.subscribeTo({
                onPlayClicked: function () {
                    me.play();
                },
                onPauseClicked: function () {
                    audioElement.pause();
                },
                onVolumeChanged: function (volume) {
                    audioElement.volume = volume / 10;
                },
                onRateChanged: function (rate) {
                    me.settings.rate = rate;
                }
            })
                .setRate(1)
                .setMinRate(1)
                .setMaxRate(3)
                .setVoice(me.forcedVoice)
                .setAudioSource(audioElement);
        });
    }

    function getPositions() {
        var p = new promise.Promise();

        talkify.http.get("/api/Speak/GetPositions?id=" + me.id)
            .then(function (error, positions) {
                p.done(null, positions);
            });

        return p;
    };

    initialize.apply(this);

    this.playAudio = function (item, onEnded) {
        me.currentContext.item = item;
        me.currentContext.positions = [];

        var p = new promise.Promise();

        var sources = audioElement.getElementsByTagName("source");

        var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));
        var voice = this.forcedVoice ? this.forcedVoice.name : "";

        sources[0].src = talkify.config.host + "/api/Speak?format=mp3&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (voice) + "&rate=" + this.settings.rate;
        sources[1].src = talkify.config.host + "/api/Speak?format=wav&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (voice) + "&rate=" + this.settings.rate;

        audioElement.load();

        //TODO: remove jquery dependency

        audioElement.onloadeddata = function () {
            me.mutateControls(function (instance) {
                instance.audioLoaded();
            });

            me.audioSource.pause();

            if (!me.settings.useTextHighlight) {
                p.done();
                me.audioSource.play();
                return;
            }

            getPositions().then(function (error, positions) {
                me.currentContext.positions = positions || [];

                p.done();
                me.audioSource.play();
            });
        };

        audioElement.onended = onEnded || function () { };

        return p;
    };

    setupBindings();
};

talkify.TtsPlayer.prototype.constructor = talkify.TtsPlayer;