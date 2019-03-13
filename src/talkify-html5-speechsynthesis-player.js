﻿//TODO: Verify all events. Especially for this player. Trigger play, pause, stop and add console outputs and see what happens
talkify = talkify || {};

talkify.Html5Player = function () {
    this.isStopped = false;
    this.volume = 1;

    this.currentContext = {
        item: null,
        endedCallback: function () { },
        utterances: [],
        currentUtterance: null
    };

    var me = this;

    this.playbar = {
        instance: null
    };

    this.audioSource = {
        play: function () {
            if (me.currentContext.item) {
                playCurrentContext();
            }
        },
        pause: function () {
            window.speechSynthesis.pause();

            talkify.messageHub.publish("player.html5.pause");
            //me.internalEvents.onPause();
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
        dispose: function () { }
    };

    talkify.BasePlayer.call(this, this.audioSource, this.playbar);

    this.playAudio = function (item, onEnded) {
        me.currentContext.endedCallback = onEnded;
        me.currentContext.item = item;
        me.currentContext.utterances = [];
        me.currentContext.currentUtterance = null;
        // me.mutateControls(function (instance) {
        //     instance.audioLoaded();
        // });

        //if (me.settings.lockedLanguage !== null) {
        return playCurrentContext();
        //}

        //TODO: Need better server side help here with refLang
        //var p = new promise.Promise();

        //talkifyHttp.get("/api/Language?text=" + item.text)
        //    .then(function (error, data) {
        //        me.settings.referenceLanguage = data;

        //        me.playCurrentContext().then(function () {
        //            p.done();
        //        });
        //    });

        //return p;
    };

    this.setVolume = function (volume) {
        me.volume = volume;

        return this;
    };

    this.mutateControls(function (c) {
        c.subscribeTo({
            onPlayClicked: function () {
                me.audioSource.play();
            },
            onPauseClicked: function () {
                me.pause();
            },
            onVolumeChanged: function (volume) {
                me.volume = volume / 10;
            },
            onRateChanged: function (rate) {
                me.settings.rate = rate / 5;
            }
        }).setVoice(me.forcedVoice);
    });

    function playCurrentContext() {
        var item = me.currentContext.item;
        var onEnded = me.currentContext.endedCallback;

        var chuncks = chunckText(item.text);

        me.currentContext.utterances = [];
        me.isStopped = false;

        chuncks.forEach(function (chunck) {
            var utterance = new window.SpeechSynthesisUtterance();

            utterance.text = chunck;
            utterance.lang = me.settings.lockedLanguage || me.settings.referenceLanguage.Culture;
            utterance.rate = me.settings.rate;
            utterance.volume = me.volume;

            me.currentContext.utterances.push(utterance);
        });

        // var p = new promise.Promise();

        var wordIndex = 0;
        var previousCharIndex = 0;
        var words = extractWords(item.text);

        me.currentContext.utterances[me.currentContext.utterances.length - 1].onend = function (e) {
            // me.events.onSentenceComplete(item);
            talkify.messageHub.publish("player.html5.utterancecomplete", item);

            if (!me.currentContext.currentUtterance) {
                return;
            }

            if (me.currentContext.currentUtterance.text !== e.currentTarget.text) {
                return;
            }

            if (onEnded && !me.isStopped) {
                onEnded();
            }
        };

        me.currentContext.utterances.forEach(function (u, index) {
            if (index === 0) {
                u.onstart = function (e) {
                    me.currentContext.currentUtterance = e.utterance;
                    // p.done();
                    talkify.messageHub.publish("player.html5.loaded", me.currentContext.item);
                   // me.internalEvents.onPlay();
                    talkify.messageHub.publish("player.html5.play", { item: me.currentContext.item, positions: [], currentTime: 0 });
                };
            } else {
                u.onstart = function (e) {
                    me.currentContext.currentUtterance = e.utterance;
                };
            }

            u.onpause = function () {
                talkify.messageHub.publish("player.html5.pause");
                //me.internalEvents.onPause();
            };

            u.onresume = function () { };

            u.onboundary = function (e) {
                if (e.name !== "word" || !words[wordIndex]) {
                    return;
                }

                me.mutateControls(function (c) {
                    c.setProgress((wordIndex + 1) / words.length);
                });

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

                me.mutateControls(function (c) {
                    c.setVoice(voice);
                });

                window.setTimeout(function () {
                    window.speechSynthesis.speak(u);
                }, 100);
            });
        });

        // return p;
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
        var p = new promise.Promise();

        if (me.forcedVoice) {
            p.done(me.forcedVoice);

            return p;
        }

        if (window.speechSynthesis.getVoices().length) {
            var voices = window.speechSynthesis.getVoices();

            p.done(selectVoiceToPlay(voices));

            return p;
        }

        window.speechSynthesis.onvoiceschanged = function () {
            var voices = window.speechSynthesis.getVoices();

            p.done(selectVoiceToPlay(voices));
        };

        return p;
    };

    function stop() {
        me.isStopped = true;
        talkify.messageHub.publish("player.html5.pause");
        //me.internalEvents.onPause();
        window.speechSynthesis.cancel();

        if (me.currentContext.utterances.indexOf(me.currentContext.currentUtterance) < me.currentContext.utterances.length - 1) {
            console.log('Not the last, finishing anyway...');
            // me.events.onSentenceComplete(me.currentContext.item);
            talkify.messageHub.publish("player.html5.utterancecomplete", me.currentContext.item);
        }
    };
};

talkify.Html5Player.prototype.constructor = talkify.Html5Player;