talkify = talkify || {};

talkify.SpeechCommands = function (speechCommandConfig) {
    if (!speechCommandConfig.enabled || !window.webkitSpeechRecognition) {
        var noop = function () { };

        return {
            onPrevious: noop,
            onNext: noop,
            onPlayPause: noop,
            start: noop,
            onListeningStarted: noop,
            onListeningEnded: noop,
            dispose: noop
        }
    }
    
    var SpeechRecognition = window.webkitSpeechRecognition;

    var isListening = false;
    var onNextCallback = function () { };
    var onPreviousCallback = function () { };
    var onPlayPauseCallback = function () { };
    var onListeningStartedCallback = function () { };
    var onListeningEndedCallback = function () { };

    var recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
        isListening = true;
        onListeningStartedCallback();
    }

    recognition.onresult = function (event) {
        var transcript = event.results[event.results.length - 1][0].transcript;

        var matchingCommandName = evaluate(transcript, speechCommandConfig.commands);

        if (speechCommandConfig.commands[matchingCommandName] === speechCommandConfig.commands.playPause) {
            onPlayPauseCallback();
        } else if (speechCommandConfig.commands[matchingCommandName] === speechCommandConfig.commands.next) {
            onNextCallback();
        } else if (speechCommandConfig.commands[matchingCommandName] === speechCommandConfig.commands.previous) {
            onPreviousCallback();
        }
    }

    recognition.onspeechend = function () {
        recognition.stop();
        isListening = false;
        onListeningEndedCallback();
    }

    function evaluate(transcript, commands) {
        var wordsInTranscript = transcript.split(' ');
        var possibleMatches = [];

        for (var key in commands) {
            if (!commands.hasOwnProperty(key)) {
                continue;
            }

            var phrases = speechCommandConfig.commands[key];

            for (var i = 0; i < phrases.length; i++) {
                if (phrases[i].toLowerCase() === transcript) {
                    //exact match
                    return key;
                }

                var match = phrases[i].split(' ').filter(function (word) {
                    return wordsInTranscript.indexOf(word.toLowerCase()) > -1;
                })[0];

                //any word in phrase mathes
                if (match) {
                    possibleMatches.push(key);
                    break;
                }
            }
        }

        if (possibleMatches.length > 0) {
            var bestValue = 0;
            var bestCommand = null;

            for (var j = 0; j < possibleMatches.length; j++) {
                var temp = Math.max.apply(Math,
                    speechCommandConfig.commands[possibleMatches[j]].map(function (phrase) {
                        return levenshtein(phrase, transcript);
                    }));

                if (temp > bestValue) {
                    bestValue = temp;
                    bestCommand = possibleMatches[j];
                }
            }

            return bestCommand;
        }

        return null;

    }

    function levenshtein(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i === 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    if (speechCommandConfig.keyboardActivation.enabled) {
        document.addEventListener("keyup",
            function (e) {
                if (!e.ctrlKey) {
                    return;
                }

                if (isListening) {
                    return;
                }

                var key = e.keyCode ? e.keyCode : e.which;

                if (key === speechCommandConfig.keyboardActivation.key) {
                    recognition.start();
                }
            });
    }

    return {
        onPrevious: function (callback) {
            onPreviousCallback = callback;
        },
        onNext: function (callback) {
            onNextCallback = callback;
        },
        onPlayPause: function (callback) {
            onPlayPauseCallback = callback;
        },
        start: function () {
            if (isListening) {
                return;
            }

            recognition.start();
        },
        onListeningStarted: function (callback) {
            onListeningStartedCallback = callback;
        },
        onListeningEnded: function (callback) {
            onListeningEndedCallback = callback;
        },
        dispose: function () {}
    }
};