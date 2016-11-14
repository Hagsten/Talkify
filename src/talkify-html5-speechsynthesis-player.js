var Html5Player = function () {
    this.isStopped = false;
    this.forcedVoice = null;
    this.volume = 1;

    this.currentContext = {
        item: null,
        endedCallback: function () { },
        utterances: [],
        currentUtterance: null
    };

    var me = this;

    this.audioSource = {
        play: function () {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();

                return;
            }

            if (me.currentContext.item) {
                me.playCurrentContext();
            }
        },
        pause: function () {
            window.speechSynthesis.pause();
        },
        ended: function () { return !window.speechSynthesis.speaking; },
        isPlaying: function () { return window.speechSynthesis.speaking; },
        paused: function () { return !window.speechSynthesis.speaking; },
        currentTime: function () { return 0; },
        cancel: function (asPause) {
            if (asPause) {
                me.stop();
            } else {
                console.log('FOOOO');
                window.speechSynthesis.cancel();
            }
        },
        stop: function () {
            me.stop();
       } 
    };

    this.__proto__.__proto__ = new BasePlayer(this.audioSource);
};

Html5Player.prototype.extractWords = function (text, language) {
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

Html5Player.prototype.getVoice = function () {
    var p = new promise.Promise();
    var me = this;

    if (this.forcedVoice) {
        p.done(this.forcedVoice);

        return p;
    }

    if (window.speechSynthesis.getVoices().length) {
        var voices = window.speechSynthesis.getVoices();

        p.done(me.selectVoiceToPlay(voices));

        return p;
    }

    window.speechSynthesis.onvoiceschanged = function () {
        var voices = window.speechSynthesis.getVoices();

        p.done(me.selectVoiceToPlay(voices));
    };

    return p;
};

Html5Player.prototype.selectVoiceToPlay = function (voices) {
    var matchingVoices = [];
    var voice = null;

    var language = this.settings.lockedLanguage || this.settings.referenceLanguage.Culture;

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

Html5Player.prototype.chunckText = function (text) {
    var language = this.settings.lockedLanguage || this.settings.referenceLanguage.Culture;
    var chunckSize = language.indexOf('zh-') > -1 ? 70 :
        language.indexOf('ko-') > -1 ? 130 : 200;

    var chuncks = [];
    var sentences = text.split(/(\?|\.|。)+/g); //('.');
    var currentChunck = '';
    var me = this;

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
            var words = me.extractWords(sentence, language);

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

Html5Player.prototype.playAudio = function (item, onEnded) {
    this.currentContext.endedCallback = onEnded;
    this.currentContext.item = item;
    this.currentContext.utterances = [];
    this.currentContext.currentUtterance = null;
    var me = this;

    //if (me.settings.lockedLanguage !== null) {
    return me.playCurrentContext();
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

Html5Player.prototype.playCurrentContext = function () {
    var item = this.currentContext.item;
    var onEnded = this.currentContext.endedCallback;

    var chuncks = this.chunckText(item.text);

    var me = this;

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

    var p = new promise.Promise();

    var wordIndex = 0;
    var previousCharIndex = 0;
    var words = this.extractWords(item.text);

    me.currentContext.utterances[me.currentContext.utterances.length - 1].onend = function (e) {
        me.events.onSentenceComplete(item);

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
            u.onstart = function(e) {
                me.currentContext.currentUtterance = e.utterance;
                p.done();
                me.internalEvents.onPlay();
            };
        } else {
            u.onstart = function (e) {
                me.currentContext.currentUtterance = e.utterance;
            };
        }

        u.onpause = function () {
            me.internalEvents.onPause();
        };

        u.onresume = function () { };

        u.onboundary = function (e) {
            if (!me.settings.useTextHighlight || !u.voice.localService) {
                return;
            }

            if (e.name !== "word" || !words[wordIndex]) {
                return;
            }

            if (!words[wordIndex]) {
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

        me.getVoice().then(function (voice) {
            if (words.length && me.settings.useTextHighlight && voice.localService) {
                me.wordHighlighter.highlight(item, words[0], 0);
            }

            u.voice = voice;

            console.log(u); //Keep this, speech bugs out otherwise
            window.speechSynthesis.cancel();

            window.setTimeout(function () {
                window.speechSynthesis.speak(u);
            }, 100);
        });
    });

    return p;
};

Html5Player.prototype.stop = function () {
    this.isStopped = true;
    window.speechSynthesis.cancel();

    if (this.currentContext.utterances.indexOf(this.currentContext.currentUtterance) < this.currentContext.utterances.length - 1) {
        console.log('Not the last, finishing anyway...');
        this.events.onSentenceComplete(this.currentContext.item);
    }
};

Html5Player.prototype.forceVoice = function (voice) {
    this.forcedVoice = voice;

    return this;
};

Html5Player.prototype.setVolume = function (volume) {
    this.volume = volume;

    return this;
}