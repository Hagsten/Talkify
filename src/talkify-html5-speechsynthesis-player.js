//TODO: Verify all events. Especially for this player. Trigger play, pause, stop and add console outputs and see what happens
talkify = talkify || {};

talkify.Html5Player = function () {
    this.isStopped = false;
    this.volume = 1;
    this.pitch = 1;

    this.currentContext = {
        item: null,
        utterances: [],
        currentUtterance: null
    };

    var timeupdater;

    var me = this;

    this.playbar = {
        instance: null
    };

    this.audioSource = {
        play: function () {
            if (me.currentContext.item) {
                playCurrentContext();
            } else {
                talkify.messageHub.publish(me.correlationId + ".player.html5.unplayable");
            }
        },
        pause: function () {
            window.speechSynthesis.pause();

            talkify.messageHub.publish(me.correlationId + ".player.html5.pause");
        },
        ended: function () { return !window.speechSynthesis.speaking; },
        isPlaying: function () { return window.speechSynthesis.speaking; },
        paused: function () { return !window.speechSynthesis.speaking; },
        currentTime: function () { return 0; },
        cancel: function (asPause) {
            if (asPause) {
                stop();
            } else {
                window.speechSynthesis.cancel();
            }
        },
        stop: function () {
            stop();
        },
        dispose: function () {
            talkify.messageHub.unsubscribe("html5player", me.correlationId + ".controlcenter.request.play");
            talkify.messageHub.unsubscribe("html5player", me.correlationId + ".controlcenter.request.pause");
            talkify.messageHub.unsubscribe("html5player", me.correlationId + ".controlcenter.request.volume");
            talkify.messageHub.unsubscribe("html5player", me.correlationId + ".controlcenter.request.rate");
            talkify.messageHub.unsubscribe("html5player", me.correlationId + ".controlcenter.request.pitch");

            if (timeupdater) {
                clearInterval(timeupdater);
            }
        }
    };

    talkify.BasePlayer.call(this, this.audioSource, this.playbar);

    this.playAudio = function (item) {
        me.currentContext.item = item;
        me.currentContext.utterances = [];
        me.currentContext.currentUtterance = null;

        playCurrentContext();
    };

    this.setVolume = function (volume) {
        me.volume = volume;

        return this;
    };

    this.usePitch = function (pitch) {
        me.pitch = pitch;

        talkify.messageHub.publish(me.correlationId + ".player.html5.pitchchanged", pitch);

        return this;
    };

    talkify.messageHub.subscribe("html5player", me.correlationId + ".controlcenter.request.play", function () { me.audioSource.play(); });
    talkify.messageHub.subscribe("html5player", me.correlationId + ".controlcenter.request.pause", function () { me.pause(); });
    talkify.messageHub.subscribe("html5player", me.correlationId + ".controlcenter.request.volume", function (volume) { me.volume = volume / 10; });
    
    talkify.messageHub.subscribe("html5player", me.correlationId + ".controlcenter.request.rate", function (rate) {
        me.settings.rate = rate;
        talkify.messageHub.publish(me.correlationId + ".player.html5.ratechanged", rate);
    });

    talkify.messageHub.subscribe("html5player", me.correlationId + ".controlcenter.request.pitch", function (pitch) {
        me.pitch = pitch;

        talkify.messageHub.publish(me.correlationId + ".player.html5.pitchchanged", me.pitch);
    });

    function playCurrentContext() {
        if (timeupdater) {
            clearInterval(timeupdater);
        }

        var item = me.currentContext.item;

        var chuncks = chunckText(item.text);

        me.currentContext.utterances = [];
        me.isStopped = false;

        chuncks.forEach(function (chunck) {
            var utterance = new window.SpeechSynthesisUtterance();

            utterance.text = chunck;
            utterance.lang = me.settings.lockedLanguage || me.settings.referenceLanguage.Culture;
            utterance.rate = me.settings.rate;
            utterance.volume = me.volume;
            utterance.pitch = me.pitch;

            me.currentContext.utterances.push(utterance);
        });

        var wordIndex = 0;
        var previousCharIndex = 0;
        var words = extractWords(item.text);

        me.currentContext.utterances[me.currentContext.utterances.length - 1].onend = function (e) {
            talkify.messageHub.publish(me.correlationId + ".player.html5.utterancecomplete", item);

            if (timeupdater) {
                clearInterval(timeupdater);
            }

            if (!me.currentContext.currentUtterance) {
                return;
            }

            if (me.currentContext.currentUtterance.text !== e.currentTarget.text) {
                return;
            }

            if (!me.isStopped) {
                talkify.messageHub.publish(me.correlationId + ".player.html5.ended", item);
            }
        };

        me.currentContext.utterances.forEach(function (u, index) {
            if (index === 0) {
                u.onstart = function (e) {
                    me.currentContext.currentUtterance = e.utterance;
                    talkify.messageHub.publish(me.correlationId + ".player.html5.loaded", me.currentContext.item);
                    talkify.messageHub.publish(me.correlationId + ".player.html5.play", { item: me.currentContext.item, positions: [], currentTime: 0 });

                    if (timeupdater) {
                        clearInterval(timeupdater);
                    }

                    timeupdater = setInterval(function () {
                        talkify.messageHub.publish(me.correlationId + ".player.html5.timeupdated", (wordIndex + 1) / words.length);
                    }, 100);
                };
            } else {
                u.onstart = function (e) {
                    me.currentContext.currentUtterance = e.utterance;
                };
            }

            u.onpause = function () {
                if (timeupdater) {
                    clearInterval(timeupdater);
                }

                talkify.messageHub.publish(me.correlationId + ".player.html5.pause");
            };

            u.onresume = function () { };

            u.onboundary = function (e) {
                if (e.name !== "word" || !words[wordIndex]) {
                    return;
                }

                if (!me.settings.useTextHighlight || !u.voice.localService) {
                    return;
                }

                var fromIndex = 0;

                for (var k = 0; k < wordIndex; k++) {
                    fromIndex += words[k].length + 1;
                }

                var isCommaOrSimilair = previousCharIndex + 1 === e.charIndex;

                if (isCommaOrSimilair) {
                    previousCharIndex = e.charIndex;
                    return;
                }

                me.wordHighlighter.highlight(item, words[wordIndex], fromIndex);
                wordIndex++;
                previousCharIndex = e.charIndex;
            };

            getVoice().then(function (voice) {
                if (words.length && me.settings.useTextHighlight && voice.localService) {
                    me.wordHighlighter.highlight(item, words[0], 0);
                }

                u.voice = voice;

                console.log(u); //Keep this, speech bugs out otherwise

                window.speechSynthesis.cancel();

                talkify.messageHub.publish(me.correlationId + ".player.html5.voiceset", voice);

                window.setTimeout(function () {
                    window.speechSynthesis.speak(u);
                }, 100);
            });
        });
    };

    function chunckText(text) {
        var language = me.settings.lockedLanguage || me.settings.referenceLanguage.Culture;
        var chunckSize = language.indexOf('zh-') > -1 ? 70 :
            language.indexOf('ko-') > -1 ? 130 : 200;

        var chuncks = [];
        var sentences = text.split(/(\?|\.|。)+/g); //('.');
        var currentChunck = '';

        sentences.forEach(function (sentence) {
            if (sentence === '' || sentence === '.' || sentence === '。' || sentence === '?') {
                if (currentChunck) {
                    currentChunck += sentence;
                }

                return;
            }

            if (currentChunck && ((currentChunck.length + sentence.length) > chunckSize)) {
                chuncks.push(currentChunck);
                currentChunck = '';
            }

            if (sentence.length > chunckSize) {
                var words = extractWords(sentence, language);

                words.forEach(function (word) {
                    if (currentChunck.length + word.length > chunckSize) {
                        chuncks.push(currentChunck);
                        currentChunck = '';
                    }

                    currentChunck += word.trim() + ' ';
                });

                if (currentChunck.trim()) {
                    chuncks.push(currentChunck.trim() + '.');
                    currentChunck = '';
                }

                return;
            }

            currentChunck += sentence;
        });

        chuncks.push(currentChunck);

        return chuncks;
    };

    function extractWords(text, language) {
        var wordRegex = new RegExp(/[&\$\-|]|([("\-&])*(\b[^\s]+[.:,"-)!&?]*)/g);

        if (language) {
            if (language.indexOf('zh-') > -1) {
                return text.split('，');
            }

            if (language.indexOf('ko-') > -1) {
                return text.split('.');
            }
        }

        var words = [];
        var m;

        while ((m = wordRegex.exec(text)) !== null) {
            if (m.index === wordRegex.lastIndex) {
                wordRegex.lastIndex++;
            }

            words.push(m[0]);
        }

        return words;
    };

    function selectVoiceToPlay(voices) {
        var matchingVoices = [];
        var voice = null;

        var language = me.settings.lockedLanguage || me.settings.referenceLanguage.Culture;

        for (var i = 0; i < voices.length; i++) {
            if (voices[i].lang === language) {
                matchingVoices.push(voices[i]);
                voice = voices[i];
            }
        }

        for (var j = 0; j < matchingVoices.length; j++) {
            if (matchingVoices[j].localService) {
                voice = matchingVoices[j];

                break;
            }
        }

        if (!voice && matchingVoices.length) {
            voice = matchingVoices[0];
        }

        if (!voice && voices.length) {
            voice = voices[0];
        }

        return voice;
    };

    function getVoice() {    
        if (me.forcedVoice) {
            return Promise.resolve(me.forcedVoice);
        }

        if (window.speechSynthesis.getVoices().length) {
            var voices = window.speechSynthesis.getVoices();

            return Promise.resolve(selectVoiceToPlay(voices));
        }

        return new Promise(function(resolve){
            window.speechSynthesis.onvoiceschanged = function () {
                var voices = window.speechSynthesis.getVoices();
    
                resolve(selectVoiceToPlay(voices));
            };
        });
    };

    function stop() {
        me.isStopped = true;
        talkify.messageHub.publish(me.correlationId + ".player.html5.pause");
        window.speechSynthesis.cancel();

        if (timeupdater) {
            clearInterval(timeupdater);
        }

        if (me.currentContext.utterances.indexOf(me.currentContext.currentUtterance) < me.currentContext.utterances.length - 1) {
            console.log('Not the last, finishing anyway...');
            talkify.messageHub.publish(me.correlationId + ".player.html5.utterancecomplete", me.currentContext.item);
        }
    };

    if (me.playbar.instance) {
        me.playbar.instance
            .setMinRate(0)
            .setMaxRate(2)
            .setRateStep(0.2)
            .setMinPitch(0)
            .setMaxPitch(2)
            .setPitchStep(0.2);
    }

    talkify.messageHub.publish(this.correlationId + ".player.html5.created");
};

talkify.Html5Player.prototype.constructor = talkify.Html5Player;