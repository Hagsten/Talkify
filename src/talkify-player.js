﻿talkify = talkify || {};

talkify.TtsPlayer = function () {
    if (!talkify.config.remoteService.active) {
        throw "This player needs to communicate to a remote service. To enable this player please set flag talkify.config.remoteService.active to true.";
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
        audioElement.addEventListener("seeked", onSeek);
    }

    function onSeek() {
        talkify.messageHub.publish("player.tts.seeked", { currentTime: this.currentTime });
        //me.wordHighlighter.setPosition(this.currentTime);

        if (me.audioSource.paused() && me.audioSource.currentTime() > 0.1) {
            me.audioSource.play();
        }
    }

    function onPause() {
        talkify.messageHub.publish("player.tts.pause");
        //me.internalEvents.onPause();
        //me.wordHighlighter.pause();
    }

    function onPlay() {      
        //me.internalEvents.onPlay();

        if (!me.currentContext.positions.length) {
            talkify.messageHub.publish("player.tts.play", { item: me.currentContext.item, positions: [], currentTime: me.audioSource.currentTime() });
            return;
        }

        if (me.audioSource.currentTime() > 0.1) {
            talkify.messageHub.publish("player.tts.resume", { currentTime: me.audioSource.currentTime() });
            //me.wordHighlighter.resume();
        } else {
            var interval = setInterval(function () {
                if (me.audioSource.currentTime() > 0) {
                    clearInterval(interval);

                    talkify.messageHub.publish("player.tts.play", { item: me.currentContext.item, positions: me.currentContext.positions, currentTime: me.audioSource.currentTime() });
                    
                    // me.wordHighlighter
                    //     .start(me.currentContext.item, me.currentContext.positions)
                    //     .then(function (completedItem) {
                    //         me.events.onSentenceComplete(completedItem);
                    //     });
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
                },
                onSeek: function (position) {
                    var pos = audioElement.duration * position;

                    if (isNaN(audioElement.duration)) {
                        return;
                    }

                    audioElement.currentTime = pos;
                }
            })
                .setRate(0)
                .setMinRate(-5)
                .setMaxRate(5)
                .setVoice(me.forcedVoice)
                .setAudioSource(audioElement);
        });

        talkify.messageHub.subscribe("wordhighlighter.complete", me.events.onSentenceComplete)
    }

    function getPositions(requestId) {
        var p = new promise.Promise();

        talkify.http.get(talkify.config.remoteService.speechBaseUrl + "/marks?id=" + requestId)
            .then(function (error, positions) {
                p.done(null, positions);
            });

        return p;
    };

    function generateGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    initialize.apply(this);

    this.playAudio = function (item, onEnded) {
        talkify.messageHub.publish("player.tts.loading", item);

        me.currentContext.item = item;
        me.currentContext.positions = [];
        //me.wordHighlighter.cancel();

        audioElement.onloadeddata = null;
        audioElement.onended = null;

        var p = new promise.Promise();

        var sources = audioElement.getElementsByTagName("source");

        var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));
        var voice = this.forcedVoice ? this.forcedVoice.name : "";

        var requestId = generateGuid();

        var audioUrl = talkify.config.remoteService.host + talkify.config.remoteService.speechBaseUrl + "?text=" + textToPlay + "&fallbackLanguage=" + this.settings.referenceLanguage.Language + "&voice=" + (voice) + "&rate=" + this.settings.rate + "&key=" + talkify.config.remoteService.apiKey;

        if (me.settings.useTextHighlight) {
            audioUrl += "&marksid=" + requestId;
        }

        sources[0].src = audioUrl + "&format=mp3";
        sources[1].src = audioUrl + "&format=wav";

        audioElement.load();

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

            getPositions(requestId).then(function (error, positions) {
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