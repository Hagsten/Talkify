talkify = talkify || {};

talkify.TtsPlayer = function (options) {
    if (!talkify.config.remoteService.active) {
        throw "This player needs to communicate to a remote service. To enable this player please set flag talkify.config.remoteService.active to true.";
    }

    var me = this;
    var audioElement, timeupdater;
    var currentVoice, currentPitch, currentWordBreak, currentRate;

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
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.wordbreak");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.pitch");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.normal");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.soft");
            talkify.messageHub.unsubscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.whisper");
        }
    };

    talkify.BasePlayer.call(this, this.audioSource, this.playbar, options);

    this.settings.whisper = false;
    this.settings.soft = false;
    this.settings.wordbreakms = 0;
    this.settings.volumeDb = 0.0;
    this.settings.pitch = 0;

    function setupBindings() {
        audioElement.addEventListener("pause", onPause);
        audioElement.addEventListener("play", onPlay);
        audioElement.addEventListener("seeked", onSeek);
    }

    function onSeek() {
        talkify.messageHub.publish(me.correlationId + ".player.tts.seeked", { time: this.currentTime, item: me.currentContext.item, positions: me.currentContext.positions });

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

        if (!me.currentContext.item) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.unplayable");

            me.audioSource.pause();
        }

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
        audioElement.autoplay = false;

        (talkify.config.ui.audioControls.container || document.body).appendChild(audioElement);

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
        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.rate", function (rate) {
            me.settings.rate = rate;

            talkify.messageHub.publish(me.correlationId + ".player.tts.ratechanged", me.settings.rate);
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.wordbreak", function (ms) {
            me.useWordBreak(ms);
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.pitch", function (value) {
            me.usePitch(value);
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.soft", function () {
            me.normalTone();
            me.usePhonation("soft");
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.normal", function () {
            me.normalTone();
            me.usePhonation("normal");
        });

        talkify.messageHub.subscribe("tts-player", me.correlationId + ".controlcenter.request.phonation.whisper", function () {
            me.usePhonation("normal");
            me.whisper();
        });

        if (me.playbar.instance) {
            me.playbar.instance
                .setMinRate(-5)
                .setMaxRate(5)
                .setRateStep(1)
                .setMinPitch(-10)
                .setMaxPitch(10)
                .setPitchStep(1);
        }

        talkify.messageHub.publish(this.correlationId + ".player.tts.created");
    }

    function getPositions(requestId) {
        return talkify.http.get(talkify.config.remoteService.speechBaseUrl + "/marks?id=" + requestId);
    };

    initialize.apply(this);

    this.downloadAudio = function (text) {
        var textType = "text";
        var voice = (me.forcedVoice ? me.forcedVoice.name : "");
        var pitch = me.settings.pitch;
        var wordbreak = me.settings.wordbreakms;
        var rate = me.settings.rate;
        var textToPlay = textType === "ssml" ?
            encodeURIComponent(text.replace(/\n/g, " ")) :
            encodeURIComponent(text.replace(/\n/g, " "));

        var obj = {
            text: text,
            rate: rate,
            volume: me.settings.volumeDb,
            voice: voice,
            whisper: me.settings.whisper,
            wordBreakMs: wordbreak,
            soft: me.settings.soft,
            pitch: pitch
        };

        var xhr = new XMLHttpRequest();
        var url = talkify.config.remoteService.host + talkify.config.remoteService.speechBaseUrl + "?key=" + talkify.config.remoteService.apiKey;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599) {
                talkify.messageHub.publish(me.correlationId + ".player.tts.download.error", xhr);
            }

            if (xhr.readyState === 4 && xhr.status === 200) {
                var link = document.createElement('a');

                link.href = URL.createObjectURL(xhr.response);
                link.download = "talkify";

                document.body.appendChild(link);

                link.dispatchEvent(
                    new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    })
                );

                setTimeout(function () {
                    document.body.removeChild(link);
                }, 1000);

                talkify.messageHub.publish(me.correlationId + ".player.tts.download.completed", null);
            }
        };
        var data = JSON.stringify(obj);
        xhr.responseType = 'blob';

        talkify.messageHub.publish(me.correlationId + ".player.tts.download.started", null);

        xhr.send(data);
    }

    this.playAudio = function (item) {
        talkify.messageHub.publish(me.correlationId + ".player.tts.loading", item);

        me.currentContext.item = item;
        me.currentContext.positions = [];

        audioElement.controls = talkify.config.ui.audioControls.enabled && talkify.config.ui.audioControls.controlcenter === "native";
        audioElement.onloadeddata = null;
        audioElement.onended = null;

        var sources = audioElement.getElementsByTagName("source");

        var textType = talkify.config.useSsml && item.ssml ? "ssml" : "text";

        var textToPlay = textType === "ssml" ?
            encodeURIComponent(item.ssml.replace(/\n/g, " ")) :
            encodeURIComponent(item.text.replace(/\n/g, " "));

        var voice = item.voice || (this.forcedVoice ? this.forcedVoice.name : "");

        if (voice !== currentVoice) {
            talkify.messageHub.publish(this.correlationId + ".player.tts.voiceset", { name: voice });
            currentVoice = voice;
        }

        var pitch = (item.pitch || this.settings.pitch);

        if (pitch !== currentPitch) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.pitchchanged", pitch);
            currentPitch = pitch;
        }

        var wordbreak = (item.wordbreakms || this.settings.wordbreakms);

        if (wordbreak !== currentWordBreak) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.wordbreakchanged", wordbreak);
            currentWordBreak = wordbreak;
        }

        var rate = (item.rate || this.settings.rate);

        if (rate !== currentRate) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.ratechanged", rate);
            currentRate = rate;
        }

        var requestId = talkify.generateGuid();

        var audioUrl = talkify.config.remoteService.host +
            talkify.config.remoteService.speechBaseUrl +
            "?texttype=" + textType +
            "&text=" + textToPlay +
            "&fallbackLanguage=" + this.settings.referenceLanguage.Language +
            "&voice=" + (voice) +
            "&rate=" + rate +
            "&key=" + talkify.config.remoteService.apiKey +
            "&whisper=" + (item.whisper || this.settings.whisper) +
            "&soft=" + (item.soft || this.settings.soft) +
            "&wordbreakms=" + wordbreak +
            "&volume=" + this.settings.volumeDb +
            "&pitch=" + pitch;

        if (me.settings.useTextHighlight) {
            audioUrl += "&marksid=" + requestId;
        }

        sources[0].src = audioUrl + "&format=mp3";
        sources[1].src = audioUrl + "&format=wav";

        sources[1].onerror = function (e) {
            talkify.messageHub.publish(me.correlationId + ".player.tts.error", null);
        }

        audioElement.load();

        audioElement.onloadeddata = function () {
            me.audioSource.pause();

            if (!me.settings.useTextHighlight) {
                talkify.messageHub.publish(me.correlationId + ".player.tts.loaded", me.currentContext.item);
                me.audioSource.play();
                return;
            }

            getPositions(requestId).then(function (positions) {
                me.currentContext.positions = positions || [];

                talkify.messageHub.publish(me.correlationId + ".player.tts.loaded", me.currentContext.item);
                me.audioSource.play();
            });
        };

        audioElement.onended = function () {
            talkify.messageHub.publish(me.correlationId + ".player.tts.ended", item);
        };
    };

    this.usePhonation = function (phonation) {
        this.settings.soft = phonation === "soft";

        talkify.messageHub.publish(me.correlationId + ".player.tts.phonationchanged", phonation);

        return this;
    };

    this.whisper = function () {
        this.settings.whisper = true;

        talkify.messageHub.publish(me.correlationId + ".player.tts.whisperchanged", true);

        return this;
    };

    this.normalTone = function () {
        this.settings.whisper = false;

        talkify.messageHub.publish(me.correlationId + ".player.tts.whisperchanged", false);

        return this;
    };

    this.useWordBreak = function (ms) {
        this.settings.wordbreakms = Math.max(0, ms);

        talkify.messageHub.publish(me.correlationId + ".player.tts.wordbreakchanged", this.settings.wordbreakms);

        return this;
    };

    this.useVolumeBaseline = function (volumeDb) {
        this.settings.volumeDb = volumeDb;

        talkify.messageHub.publish(me.correlationId + ".player.tts.volumechanged", volumeDb);

        return this;
    };

    this.usePitch = function (pitch) {
        this.settings.pitch = pitch;

        talkify.messageHub.publish(me.correlationId + ".player.tts.pitchchanged", pitch);

        return this;
    };

    setupBindings();
};

talkify.TtsPlayer.prototype.constructor = talkify.TtsPlayer;