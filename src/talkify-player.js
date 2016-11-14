function TtsPlayer() {
    var me = this;
    var audioElement;

    this.currentContext = {
        item: null,
        positions: []
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
        }
    };

    this.forcedVoice = "";

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

        if (me.audioSource.currentTime() > 0) {
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
        audioElement.controls = true;
        audioElement.autoplay = true;

        document.body.appendChild(audioElement);

        var clonedAudio = audioElement.cloneNode(true);
        audioElement.parentNode.replaceChild(clonedAudio, audioElement);

        audioElement = clonedAudio;
    }

    initialize();
    this.audioElement = audioElement;

    this.__proto__.__proto__ = new BasePlayer(this.audioSource);

    setupBindings();
};

TtsPlayer.prototype.getPositions = function () {
    var me = this;
    var p = new promise.Promise();

    talkifyHttp.get("/api/Speak/GetPositions?id=" + me.id)
        .then(function (error, positions) {
            p.done(null, positions);
        });

    return p;
};

TtsPlayer.prototype.playAudio = function (item, onEnded) {
    var me = this;

    me.currentContext.item = item;
    me.currentContext.positions = [];

    var p = new promise.Promise();

    var sources = this.audioElement.getElementsByTagName("source");

    var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));

    sources[0].src = talkifyConfig.host + "/api/Speak?format=mp3&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (this.forcedVoice || "") + "&rate=" + this.settings.rate;
    sources[1].src = talkifyConfig.host + "/api/Speak?format=wav&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (this.forcedVoice || "") + "&rate=" + this.settings.rate;

    this.audioElement.load();

    //TODO: remove jquery dependency
    $(this.audioElement)
        .unbind("loadeddata")
        .bind("loadeddata", function () {
            me.audioSource.pause();

            if (!me.settings.useTextHighlight) {
                p.done();
                me.audioSource.play();
                return;
            }

            me.getPositions().then(function (error, positions) {
                me.currentContext.positions = positions || [];

                p.done();
                me.audioSource.play();
            });
        })
        .unbind("ended.justForUniqueness")
        .bind("ended.justForUniqueness", onEnded || function () { });

    return p;
};

TtsPlayer.prototype.forceVoice = function (voice) {
    this.forcedVoice = voice;

    return this;
};
