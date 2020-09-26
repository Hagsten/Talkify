(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.promise = require('./src/promise.js');
var talkify = require('./src/talkify.js');
var talkifyConfig = require('./src/talkify-config.js');
var talkifyUtils = require('./src/talkify-utils.js');
var talkifyMessageHub = require('./src/talkify-messagehub.js');
var talkifyHttp = require('./src/talkify-ajax.js');
var TalkifyTextextractor = require('./src/talkify-textextractor.js');
var TalkifyWordHighlighter = require('./src/talkify-word-highlighter.js');
var BasePlayer = require('./src/talkify-player-core.js');
var Html5Player = require('./src/talkify-html5-speechsynthesis-player.js');
var TtsPlayer = require('./src/talkify-player.js');
var talkifyPlaylist = require('./src/talkify-playlist.js');
var talkifyControlcenterCore = require('./src/control-centers/talkify-controlcenter-core.js');
var talkifyPlaybar = require('./src/control-centers/talkify-controlcenter-classic.js');
var talkifyModernControlcenter = require('./src/control-centers/talkify-controlcenter-modern.js');
var talkifyLocalControlcenter = require('./src/control-centers/talkify-controlcenter-local.js');
var talkifyKeyCommands = require('./src/talkify-keyboard-commands.js');
var talkifyVoiceCommands = require('./src/talkify-speech-recognition.js');
var talkifyFormReader = require('./src/talkify-formreader.js');
var talkifyTestSelectionActivator = require('./src/talkify-text-selection-activator.js');

},{"./src/control-centers/talkify-controlcenter-classic.js":2,"./src/control-centers/talkify-controlcenter-core.js":3,"./src/control-centers/talkify-controlcenter-local.js":4,"./src/control-centers/talkify-controlcenter-modern.js":5,"./src/promise.js":6,"./src/talkify-ajax.js":7,"./src/talkify-config.js":8,"./src/talkify-formreader.js":9,"./src/talkify-html5-speechsynthesis-player.js":10,"./src/talkify-keyboard-commands.js":11,"./src/talkify-messagehub.js":12,"./src/talkify-player-core.js":13,"./src/talkify-player.js":14,"./src/talkify-playlist.js":15,"./src/talkify-speech-recognition.js":16,"./src/talkify-text-selection-activator.js":17,"./src/talkify-textextractor.js":18,"./src/talkify-utils.js":19,"./src/talkify-word-highlighter.js":20,"./src/talkify.js":21}],2:[function(require,module,exports){
talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.classic = function () {
    this.html = '<div class="talkify-control-center classic attached">\
        <ul>  \
        <li class="talkify-drag-area talkify-detached">  \
        <i class="fa fa-grip-horizontal"></i>  \
        </li>  \
        <li>  \
        <button class="talkify-play-button talkify-disabled" title="Play">  \
        <i class="fa fa-play"></i>  \
        </button>  \
        <button class="talkify-pause-button talkify-disabled" title="Pause">  \
        <i class="fa fa-pause"></i>  \
        </button>  \
        <i class="fa fa-circle-notch fa-spin talkify-audio-loading"></i> \
        <i class="fas fa-exclamation-triangle talkify-audio-error" title="An error occurred at playback"></i> \
        </li>  \
        <li class="progress-wrapper">  \
        <progress value="0.0" max="1.0"></progress>  \
       <span class="talkify-time-element"> 00:00 / 00:00 </span> \
        </li>  \
        <li>  \
        <button class="talkify-volume-button" title="Volume">  \
        <i class="fa fa-volume-up"></i>  \
        <div class="volume-slider">  \
        <input type="range" value="10" min="0" max="10" title="Adjust playback volume">  \
        </div>  \
        </button></li>  \
       <li>  \
       <button class="talkify-rate-button" title="Rate of speech">  \
       <i class="fa fa-tachometer-alt"></i>  \
        <div class="rate-slider">  \
       <input type="range" value="10" min="0" max="10" title="Adjust playback rate">  \
       </div>  \
        </button>  \
        </li>  \
        <li>  \
        <button class="talkify-cc-button" title="Enable/disable text highlighting">  \
       <i class="fa fa-closed-captioning"></i>  \
       </button>  \
       </li>\
       <li>\
            <button class="talkify-enhanced-visibility-button" title="Toggle enhanced visibility">\
                <i class="fas fa-eye"></i>\
            </button>\
        </li>\
        <li>  \
        <button class="talkify-detached talkify-attach-handle" title="Dock player to screen">  \
        <i class="fa fa-window-minimize"></i>  \
        </button>  \
        <button class="talkify-attached talkify-detatch-handle" title="Detach player">  \
       <i class="fa fa-window-maximize"></i>  \
       </button>  \
       </li> \
       <li class="talkify-voice-selector"> \
       <label for="voice-selector-toggle"> \
        Voice: <span></span> \
       </label><input type="checkbox" id="voice-selector-toggle" style="display: none;"/>; \
           </li> \
           </ul></div>';

}
},{}],3:[function(require,module,exports){
talkify = talkify || {};
talkify.playbar = function (parent, correlationId, controlcenter) {
    var mainFlags = ["de-DE", "fr-FR", "en-US", "zh-CN", "es-ES", "it-IT", "ja-JP", "ko-KR", "sv-SE", "nb-NO", "da-DK", "ru-RU", "nl-NL", "pl-PL", "tr-TR", "is-IS", "uk-UA", "sk-SK", "pt-PT", "ro-RO", "cy-GB", "bg-BG", "cs-CZ", "el-GR", "fi-FI", "he-IL", "hi-IN", "hr-HR", "hu-HU", "id-ID", "ms-MY", "sl-SI", "th-TH", "vi-VN", "ar-EG", "ar-SA", "ta-IN", "te-IN", "en-GB-WLS", "ca-ES", "gu-IN", "ml-IN", "bn-IN", "kn-IN", "fil-PH"];

    var settings = {
        parentElement: parent || talkify.config.ui.audioControls.container || document.body,
        controlCenterName: controlcenter || talkify.config.ui.audioControls.controlcenter
    }

    var playElement, pauseElement, rateElement, volumeElement, progressElement, voiceElement, currentTimeElement, textHighlightingElement, wrapper, voicePicker;
    var attachElement, detatchedElement, dragArea, loader, erroroccurredElement, textInteractionElement, pitchElement, wordBreakElement, wordBreakElementWrapper;
    var pitchElementWrapper, nextItemElement, previousItemElement, voiceNameElement, enhancedVisibilityElement;
    var flagElement, phonationNormalElement, phonationSoftElement, phonationWhisperElement, phonationDropDown;
    var voices = [];

    var noopElement = document.createElement("div");
    playElement = pitchElementWrapper = nextItemElement = enhancedVisibilityElement = voiceNameElement = previousItemElement = phonationNormalElement = phonationSoftElement = phonationWhisperElement = phonationDropDown = flagElement = wordBreakElement = wordBreakElementWrapper = pitchElement = dragArea = textInteractionElement = voiceWrapperElement = attachElement = currentTimeElement = detatchedElement = pauseElement = loader = erroroccurredElement = progressElement = textHighlightingElement = noopElement;
    rateElement = volumeElement = [];

    function hide(element) {
        if (!element || element.classList.contains("talkify-hidden")) {
            return;
        }

        element.className += " talkify-hidden";
    }

    function show(element) {
        if (!element) {
            return;
        }

        element.className = element.className.replace("talkify-hidden", "");
    }

    function play() {
        hide(loader);
        hide(playElement);
        hide(erroroccurredElement);
        show(pauseElement);
    }

    function pause() {
        hide(loader);
        hide(pauseElement);
        hide(erroroccurredElement);
        show(playElement);
    }

    function onError() {
        hide(loader);
        hide(pauseElement);
        hide(playElement);
        show(erroroccurredElement);
    }

    function addClass(element, c) {
        if (element.classList.contains(c)) {
            return;
        }

        element.className += (" " + c);
    }

    function removeClass(element, c) {
        element.className = element.className.replace(c, "");
    }

    function createElement(type, classes) {
        var element = document.createElement(type);

        element.className = classes;

        return element;
    }

    var groupBy = function (xs, keyFn) {
        return xs.reduce(function (rv, x) {
            var key = keyFn(x);

            (rv[key] = rv[key] || []).push(x);
            return rv;
        }, {});
    };

    function createVoicePicker(voices, remoteVoices) {
        var mainUl = createElement("ul", "voice-selector");

        if (!voices.length) {
            return mainUl;
        }

        var byLanguage = groupBy(voices, function (v) {
            return remoteVoices ? v.language : v.lang;
        });

        for (var prop in byLanguage) {
            if (!byLanguage.hasOwnProperty(prop)) {
                continue;
            }

            var sortedVoices = byLanguage[prop].sort(function (a, b) {
                return remoteVoices ? (a.culture - b.culture) : (a.name - b.name);
            });

            var defaultVoice = remoteVoices ?
                sortedVoices.filter(function (x) { return x.isStandard; })[0] :
                (sortedVoices.filter(function (x) { return x.localService; })[0] || sortedVoices[0]);

            var foo = sortedVoices.find(function (v) {
                return mainFlags.indexOf(v.culture || v.lang) !== -1;
            });

            if (!foo) {
                continue;
            }

            var mainCulture = foo.culture || foo.lang;

            var mainFlag = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/4x3/" + mainCulture.split("-")[1].toLowerCase() + ".svg";

            var li = createElement("li");

            var flagImg = createElement("img", "talkify-flag");
            flagImg.src = mainFlag;

            var label = createElement("label", "talkify-clickable");
            label.innerHTML = sortedVoices[0].language || sortedVoices[0].lang;
            label.htmlFor = "chk_" + prop;

            var checkbox = createElement("input", "");
            checkbox.id = "chk_" + prop;
            checkbox.type = "checkbox";
            checkbox.style = "display: none";

            li.appendChild(flagImg);
            li.appendChild(label);
            li.appendChild(checkbox);

            var innerUl = createElement("ul", "language");

            li.appendChild(innerUl);

            for (var j = 0; j < sortedVoices.length; j++) {
                var voice = sortedVoices[j];
                var isDefault = !!defaultVoice && voice === defaultVoice;

                var innerLi = createElement("li", "talkify-clickable");
                innerLi.setAttribute("data-default", isDefault);
                innerLi.setAttribute("data-voice", remoteVoices ? JSON.stringify(voice) : voice.name);
                innerLi.setAttribute("data-voice-name", voice.name);

                var d = createElement("div", "");

                if (voice.isNeural) {
                    var i = createElement("i", "fas fa-network-wired");
                    i.setAttribute("title", "Neural voice");
                }
                else if (voice.isExclusive) {
                    var i = createElement("i", "fas fa-star");
                    i.setAttribute("title", "Exclusive voice");
                }
                else if (voice.isPremium) {
                    var i = createElement("i", "far fa-star");
                    i.setAttribute("title", "Premium voice");
                } else {
                    var i = createElement("i", "far fa-check-circle");
                    i.setAttribute("title", "Standard voice");
                }

                var span = createElement("span");
                span.innerHTML = voice.name;

                d.appendChild(i);
                d.appendChild(span);

                var flagDiv = createElement("div");
                var svg = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/4x3/" + (voice.culture || voice.lang).split("-")[1].toLowerCase() + ".svg";

                var svgImg = createElement("img", "talkify-flag");
                svgImg.src = svg;

                flagDiv.appendChild(svgImg);

                innerLi.appendChild(d);
                innerLi.appendChild(flagDiv);
                innerUl.appendChild(innerLi);
            }

            mainUl.appendChild(li);
        }

        return mainUl;
    }

    function render() {
        var existingControl = document.getElementsByClassName("talkify-control-center")[0];

        if (existingControl) {
            existingControl.parentNode.removeChild(existingControl);
        }

        var controlcenter = new talkify.controlcenters[settings.controlCenterName]();

        var div = document.createElement('div');
        div.innerHTML = controlcenter.html.trim();

        wrapper = div.firstChild;

        settings.parentElement.appendChild(wrapper);        

        playElement = wrapper.getElementsByClassName("talkify-play-button")[0] || noopElement;
        pauseElement = wrapper.getElementsByClassName("talkify-pause-button")[0] || noopElement;
        loader = wrapper.getElementsByClassName("talkify-audio-loading")[0] || noopElement;
        erroroccurredElement = wrapper.getElementsByClassName("talkify-audio-error")[0] || noopElement;
        rateElement = wrapper.querySelectorAll(".talkify-rate-button input[type=range]") || [];
        volumeElement = wrapper.querySelectorAll(".talkify-volume-button input[type=range]") || [];
        progressElement = wrapper.getElementsByTagName("progress")[0] || noopElement;
        textHighlightingElement = wrapper.getElementsByClassName("talkify-cc-button")[0] || noopElement;
        currentTimeElement = wrapper.getElementsByClassName("talkify-time-element")[0] || noopElement;
        detatchedElement = wrapper.getElementsByClassName("talkify-detatch-handle")[0] || noopElement;
        attachElement = wrapper.getElementsByClassName("talkify-attach-handle")[0] || noopElement;
        voiceWrapperElement = wrapper.querySelector(".talkify-voice-selector") || noopElement;
        dragArea = wrapper.getElementsByClassName("talkify-drag-area")[0] || noopElement;
        textInteractionElement = wrapper.getElementsByClassName("talkify-text-interaction-button")[0] || noopElement;
        pitchElementWrapper = wrapper.querySelector(".talkify-pitch-element") || noopElement;
        pitchElement = pitchElementWrapper.getElementsByTagName("input")[0] || noopElement;
        wordBreakElementWrapper = wrapper.querySelector(".talkify-wordbreak-element") || noopElement;
        wordBreakElement = wordBreakElementWrapper.getElementsByTagName("input")[0] || noopElement;
        flagElement = wrapper.getElementsByClassName("talkify-selected-voice-flag")[0] || noopElement;
        phonationDropDown = wrapper.querySelector(".talkify-phonation-element") || noopElement;
        phonationWhisperElement = wrapper.querySelector("#talkify-phonation-whisper") || noopElement;
        phonationSoftElement = wrapper.querySelector("#talkify-phonation-soft") || noopElement;
        phonationNormalElement = wrapper.querySelector("#talkify-phonation-normal") || noopElement;
        nextItemElement = wrapper.getElementsByClassName("talkify-step-forward-button")[0] || noopElement;
        previousItemElement = wrapper.getElementsByClassName("talkify-step-backward-button")[0] || noopElement;
        voiceNameElement = document.querySelector(".talkify-voice-selector span") || noopElement;
        enhancedVisibilityElement = document.querySelector(".talkify-enhanced-visibility-button") || noopElement;

        settings.parentElement.appendChild(wrapper);

        talkify.messageHub.publish(correlationId + ".controlcenter.attached", wrapper.getBoundingClientRect());

        hide(loader);

        pause();
    }

    function setupBindings() {
        var controlCenter = document.getElementsByClassName("talkify-control-center")[0];

        playElement.addEventListener("click", function () {
            if (playElement.classList.contains("talkify-disabled")) {
                return;
            }

            talkify.messageHub.publish(correlationId + ".controlcenter.request.play");
        });

        pauseElement.addEventListener("click", function () {
            if (pauseElement.classList.contains("talkify-disabled")) {
                return;
            }
            talkify.messageHub.publish(correlationId + ".controlcenter.request.pause");
        });

        rateElement.forEach(function (x) {
            x.addEventListener("change", function () {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.rate", parseFloat(this.value));
            })
        });

        volumeElement.forEach(function (x) {
            x.addEventListener("change", function (e) {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.volume", parseInt(this.value));
            });
        });

        pitchElement.addEventListener("change", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.pitch", parseInt(this.value));
        });

        wordBreakElement.addEventListener("change", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.wordbreak", parseInt(this.value));
        });

        phonationDropDown.addEventListener("change", function () {
            if (this.value === "normal") {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.normal");
            } else if (this.value === "soft") {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.soft");
            } else if (this.value === "whisper") {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.whisper");
            }
        });

        phonationWhisperElement.addEventListener("click", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.whisper");
        });

        phonationSoftElement.addEventListener("click", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.soft");
        });

        phonationNormalElement.addEventListener("click", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.phonation.normal");
        });

        textHighlightingElement.addEventListener("click", function (e) {
            if (textHighlightingElement.classList.contains("talkify-disabled")) {
                removeClass(textHighlightingElement, "talkify-disabled");
                talkify.messageHub.publish(correlationId + ".controlcenter.texthighlightoggled", true);
            } else {
                addClass(textHighlightingElement, "talkify-disabled");
                talkify.messageHub.publish(correlationId + ".controlcenter.texthighlightoggled", false);
            }
        });

        textInteractionElement.addEventListener("click", function (e) {
            if (textInteractionElement.classList.contains("talkify-disabled")) {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.textinteractiontoggled", true);
            } else {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.textinteractiontoggled", false);
            }
        });

        enhancedVisibilityElement.addEventListener("click", function (e) {
            if (enhancedVisibilityElement.classList.contains("talkify-disabled")) {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.enhancedvisibility", true);
            } else {
                talkify.messageHub.publish(correlationId + ".controlcenter.request.enhancedvisibility", false);
            }
        });

        nextItemElement.addEventListener("click", function () {
            if (nextItemElement.classList.contains("talkify-disabled")) {
                return;
            }

            talkify.messageHub.publish(correlationId + ".controlcenter.request.playnext");
        });

        previousItemElement.addEventListener("click", function () {
            if (previousItemElement.classList.contains("talkify-disabled")) {
                return;
            }

            talkify.messageHub.publish(correlationId + ".controlcenter.request.playprevious");
        });

        progressElement.addEventListener("click", function (e) {
            var clickedValue = (e.offsetX * this.max) / this.offsetWidth;

            if (clickedValue > 1.0) {
                clickedValue = 1.0;
            }

            if (clickedValue < 0.0) {
                clickedValue = 0.0;
            }

            talkify.messageHub.publish(correlationId + ".controlcenter.request.seek", clickedValue);
        });

        attachElement.addEventListener("click", function () {
            addClass(controlCenter, "attached");
            removeClass(controlCenter, "detached");

            talkify.messageHub.publish(correlationId + ".controlcenter.attached", controlCenter.getBoundingClientRect());
        });

        detatchedElement.addEventListener("click", function () {
            removeClass(controlCenter, "attached");
            addClass(controlCenter, "detached");

            talkify.messageHub.publish(correlationId + ".controlcenter.detatched", controlCenter.getBoundingClientRect());
        });

        dragArea.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);


        function onMouseUp(e) {
            document.removeEventListener("mousemove", onMouseMove);
        }

        function onMouseDown(e) {
            document.addEventListener("mousemove", onMouseMove);
        }

        function onMouseMove(e) {
            e.preventDefault();

            var dArea = dragArea.getBoundingClientRect();
            var leftOffset = (dArea.width / 2) + dArea.x - controlCenter.getBoundingClientRect().x;

            controlCenter.style.top = e.clientY - (controlCenter.offsetHeight / 2) + "px";
            controlCenter.style.left = e.clientX - leftOffset + "px";
        }
    }

    function initialize() {
        if (settings.controlCenterName === "native") {
            return;
        }

        render();
        setupBindings();

        talkify.messageHub.subscribe("controlcenter", [correlationId + ".player.*.pause", correlationId + ".player.*.disposed", correlationId + ".player.html5.ended"], pause);
        talkify.messageHub.subscribe("controlcenter", [correlationId + ".player.*.play", correlationId + ".player.*.resume"], play);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.disposed", dispose);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.loading", function () {
            hide(playElement);
            hide(pauseElement);
            hide(erroroccurredElement);
            show(loader);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.loaded", function () {
            removeClass(pauseElement, "talkify-disabled");
            removeClass(playElement, "talkify-disabled");
            show(playElement);
            hide(loader);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.texthighlight.enabled", function () {
            removeClass(textHighlightingElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.texthighlight.disabled", function () {
            addClass(textHighlightingElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.ratechanged", function (rate) {
            rateElement.forEach(function (x) {
                x.value = rate;
            });
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.voiceset", function (voice) {
            featureToggle(voice);
            setVoiceName(voice);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.error", onError);

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.timeupdated", updateClock);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.html5.timeupdated", function (value) {
            progressElement.setAttribute("value", value);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.loaded", function () {
            removeClass(playElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.textinteraction.enabled", function () {
            removeClass(textInteractionElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.textinteraction.disabled", function () {
            addClass(textInteractionElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.wordbreakchanged", function (ms) {
            wordBreakElement.value = ms;
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.pitchchanged", function (value) {
            pitchElement.value = value;
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.phonationchanged", function (phonation) {
            phonationDropDown.value = phonation === "soft" ? "soft" : "normal";
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.whisperchanged", function (whisper) {
            phonationDropDown.value = whisper ? "whisper" : "normal";
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.created", function () {
            getRemoteVoices();
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.html5.created", function () {
            if (!talkify.config.ui.audioControls.voicepicker.enabled) {
                return;
            }

            getLocalVoices();
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.enhancedvisibilityset", function (value) {
            if (value) {
                removeClass(enhancedVisibilityElement, "talkify-disabled");
            } else {
                addClass(enhancedVisibilityElement, "talkify-disabled");
            }
        });


        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.playing", function (msg) {
            removeClass(nextItemElement, "talkify-disabled");
            removeClass(previousItemElement, "talkify-disabled");

            if (msg.isLast) {
                addClass(nextItemElement, "talkify-disabled");
            }

            if (msg.isFirst) {
                addClass(previousItemElement, "talkify-disabled");
            }
        });
    };

    function getLocalVoices() {
        window.speechSynthesis.getVoices();
        setTimeout(function () {
            voices = window.speechSynthesis.getVoices();
            voicePicker = createVoicePicker(filterVoicesByConfig(voices), false);

            wrapper.getElementsByClassName("talkify-voice-selector")[0].appendChild(voicePicker);

            voicePicker.querySelectorAll(".language > li").forEach(function (item) {
                item.addEventListener('click', function (e) {
                    var voice = voices.find(function (v) { return v.name === e.currentTarget.dataset.voice });

                    talkify.messageHub.publish(correlationId + ".controlcenter.request.setvoice", voice);
                });
            });

            if (voiceNameElement.textContent) {
                var backendVoice = voices.find(function (v) {
                    return v.name === voiceNameElement.textContent;
                });

                if (backendVoice) {
                    featureToggle(backendVoice);
                    setVoiceName(backendVoice);
                }
            }
        }, 100);
    }

    function getRemoteVoices() {
        talkify.http.get(talkify.config.remoteService.speechBaseUrl + "/voices")
            .then(function (error, data) {
                if (error !== false) {
                    return;
                }

                voices = window.talkify.toLowerCaseKeys(data);

                if (voiceNameElement.textContent) {
                    var backendVoice = voices.find(function (v) {
                        return v.name === voiceNameElement.textContent;
                    });

                    if (backendVoice) {
                        featureToggle(backendVoice);
                        setVoiceName(backendVoice);
                    }
                }

                if (!talkify.config.ui.audioControls.voicepicker.enabled) {
                    return;
                }

                voicePicker = createVoicePicker(filterVoicesByConfig(voices), true);

                wrapper.getElementsByClassName("talkify-voice-selector")[0].appendChild(voicePicker);

                voicePicker.querySelectorAll(".language > li").forEach(function (item) {
                    item.addEventListener('click', function (e) {
                        var voice = JSON.parse(e.currentTarget.dataset.voice);

                        talkify.messageHub.publish(correlationId + ".controlcenter.request.setvoice", window.talkify.toLowerCaseKeys(voice));
                    });
                });
            });
    }

    function filterVoicesByConfig(voices) {
        var filter = talkify.config.ui.audioControls.voicepicker.filter;

        if (!filter) {
            return voices;
        }

        return voices.filter(function (voice) {
            var active = true;

            if (filter.byCulture.length) {
                active = filter.byCulture.indexOf(voice.culture || voice.lang) !== -1;
            }

            if (active && filter.byLanguage.length) {
                active = filter.byLanguage.indexOf(voice.language) !== -1;
            }

            if (active && filter.byClass.length) {
                if (filter.byClass.indexOf("Standard") !== -1 && voice.isStandard) {
                    return true;
                }

                if (filter.byClass.indexOf("Premium") !== -1 && voice.isPremium) {
                    return true;
                }

                if (filter.byClass.indexOf("Exclusive") !== -1 && voice.isExclusive) {
                    return true;
                }

                if (filter.byClass.indexOf("Neural") !== -1 && voice.isNeural) {
                    return true;
                }

                return false;
            }

            return active;
        });
    }

    function updateClock(timeInfo) {
        var currentTime = timeInfo.currentTime;
        var duration = timeInfo.duration;
        //TODO: Over tunnels duration === NaN. Look @ http://stackoverflow.com/questions/10868249/html5-audio-player-duration-showing-nan
        progressElement.setAttribute("value", currentTime / duration);

        if (!currentTimeElement) {
            return;
        }

        var currentminutes = Math.floor(currentTime / 60);
        var currentseconds = Math.round(currentTime) - (currentminutes * 60);

        var totalminutes = !!duration ? Math.floor(duration / 60) : 0;
        var totalseconds = !!duration ? Math.round(duration) - (totalminutes * 60) : 0;

        currentTimeElement.textContent = currentminutes + ":" + ((currentseconds < 10) ? "0" + currentseconds : currentseconds) +
            " / " +
            totalminutes + ":" + ((totalseconds < 10) ? "0" + totalseconds : totalseconds);
    }

    function isTalkifyHostedVoice(voice) {
        return voice && voice.constructor.name !== "SpeechSynthesisVoice";
    }

    function featureToggle(voice) {
        show(progressElement);
        show(textHighlightingElement);

        if (!voice) {
            return;
        }

        var backendVoice = voices.find(function (v) {
            return v.name === voice.name;
        });

        if (backendVoice) {
            voice = backendVoice;
        }

        voice.canUseWordBreak ? show(wordBreakElementWrapper) : hide(wordBreakElementWrapper);

        voice.canWhisper ? show(phonationWhisperElement) : hide(phonationWhisperElement);
        voice.canSpeakSoftly ? show(phonationSoftElement) : hide(phonationSoftElement);

        if (voice.canSpeakSoftly) {

        }

        if (isTalkifyHostedVoice(voice)) {
            voice.canUsePitch ? show(pitchElementWrapper) : hide(pitchElementWrapper);
            return;
        }

        show(pitchElementWrapper);
        hide(currentTimeElement);

        if (!voice.localService) {
            hide(progressElement);
            hide(textHighlightingElement);
        }
    }

    function setVoiceName(voice) {
        if (!voice) {
            voiceNameElement.textContent = "Automatic voice detection";
            return;
        }

        var backendVoice = voices.find(function (v) {
            return v.name === voice.name;
        });

        if (backendVoice) {
            voice = backendVoice;
        }

        var split = (voice.culture || voice.lang || "").split("-");

        if (split.length > 1) {
            flagElement.src = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/4x3/" + split[1].toLowerCase() + ".svg";
            show(flagElement);
        } else {
            hide(flagElement);
        }

        voiceNameElement.textContent = voice.name;
    }

    function dispose() {
        var existingControl = document.getElementsByClassName("talkify-control-center")[0];

        if (existingControl) {
            existingControl.parentNode.removeChild(existingControl);
        }

        talkify.messageHub.unsubscribe("controlcenter", [correlationId + ".player.*.pause", correlationId + ".player.*.disposed"]);
        talkify.messageHub.unsubscribe("controlcenter", [correlationId + ".player.*.play", correlationId + ".player.*.resume"]);
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.disposed");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.loaded");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.loading");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.texthighlight.enabled");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.texthighlight.disabled");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.ratechanged");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.voiceset");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.timeupdated");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.html5.timeupdated");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".playlist.loaded");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.error");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".playlist.textinteraction.enabled");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".playlist.textinteraction.disabled");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.wordbreakchanged");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.pitchchanged");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.phonationchanged");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.whisperchanged");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".playlist.playing");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.html5.ended");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.created");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.html5.created");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.*.enhancedvisibilityset");
    }

    initialize();

    return {
        setMaxRate: function (value) {
            rateElement.forEach(function (x) {
                x.setAttribute("max", value);
            });

            return this;
        },
        setMinRate: function (value) {
            rateElement.forEach(function (x) {
                x.setAttribute("min", value);
            });

            return this;
        },
        setRateStep: function (value) {
            rateElement.forEach(function (x) {
                x.setAttribute("step", value);
            });

            return this;
        },
        setMaxPitch: function (value) {
            pitchElement.setAttribute("max", value);

            return this;
        },
        setMinPitch: function (value) {
            pitchElement.setAttribute("min", value);

            return this;
        },
        setPitchStep: function (value) {
            pitchElement.setAttribute("step", value);

            return this;
        },
        dispose: dispose
    }
}
},{}],4:[function(require,module,exports){
talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.local = function () {
    this.html =
        '<div class="talkify-control-center local">\
            <div>\
                <div class="talkify-brand">T</i></div>\
                <button class="talkify-step-backward-button" title="Previous">\
                    <i class="fa fa-step-backward"></i>\
                </button>\
                <button class="talkify-play-button" title="Listen to text">\
                    <i class="fas fa-play"></i>\
                </button>\
                <div class="talkify-audio-loading">\
                    <i class="fas fa-dharmachakra fa-spin"></i>\
                </div>\
                <button class="talkify-pause-button" title="Pause">\
                    <i class="fas fa-pause"></i>\
                </button>\
                <button class="talkify-audio-error" title="An error occurred at playback"><i class="fas fa-exclamation-triangle"></i></button>\
                <button class="talkify-step-forward-button" title="Next">\
                    <i class="fa fa-step-forward"></i>\
                </button>\
                <button class="talkify-cc-button" title="Toggle text highlighting">\
                    <i class="fa fa-closed-captioning"></i>\
                </button>\
                <button class="talkify-text-interaction-button" title="Toggle text interaction">\
                    <i class="fas fa-hand-point-up"></i>\
                </button>\
                <button class="talkify-enhanced-visibility-button" title="Toggle enhanced visibility">\
                    <i class="fas fa-eye"></i>\
                </button>\
                <button title="More settings">\
                    <label for="talkify-local-settings"><i class="fas fa-cog"></i></label>\
                </button>\
            </div>\
            <input type="checkbox" style="display:none;" id="talkify-local-settings"/>\
            <div class="talkify-columns talkify-more-settings">\
                <div title="Adjust playback volume">\
                    <i class="fas fa-volume-up"></i>\
                    <div class="volume-slider talkify-volume-button">\
                        <input type="range" value="10" min="0" max="10">\
                    </div>\
                </div>\
                <div title="Adjust playback rate">\
                    <i class="fa fa-tachometer-alt"></i>\
                    <div class="rate-slider talkify-rate-button">\
                        <input type="range" value="5" min="0" max="10">\
                    </div>\
                </div>\
            </div>\
        </div>';
};
},{}],5:[function(require,module,exports){
talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.modern = function (parent, correlationId) {

    this.html = '<div class="talkify-control-center modern attached"> \
    <progress value="0" max="1.0"></progress>\
    <ul class="player-controls">\
        <li style="display: flex; justify-content: center;">\
            <button data-type="drag" class="talkify-detached talkify-drag-area" title="Drag player">\
                <i class="fa fa-grip-horizontal"></i>\
            </button>\
            <button class="talkify-attached talkify-detatch-handle" title="Detatch player">\
                <i class="fa fa-window-maximize"></i>\
            </button>\
            <div class="player-settings">\
                <button>\
                    <label for="player-settings-toggle" title="More settings">\
                        <i class="fas fa-ellipsis-h"></i>\
                    </label>\
                </button>\
                <input type="checkbox" id="player-settings-toggle" style="display: none;" />\
                <ul>\
                    <li>\
                        <button class="modern-talkify-control-center-accent" title="Playback mode">\
                            <i class="fas fa-music"></i>\
                        </button>\
                        <select class="talkify-phonation-element">\
                            <option id="talkify-phonation-normal" value="normal">Normal tone</option>\
                            <option id="talkify-phonation-soft" value="soft">Softer tone</option>\
                            <option id="talkify-phonation-whisper" value="whisper">Whisper</option>\
                        </select>\
                    </li>\
                    <li class="talkify-wordbreak-element">\
                        <button class="modern-talkify-control-center-accent" title="Word break">\
                            <i class="fas fa-arrows-alt-h"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="0" min="0" max="3000" title="Adjust pause between words">\
                        </div>\
                    </li>\
                    <li class="talkify-pitch-element">\
                        <button class="modern-talkify-control-center-accent" title="Adjust pitch">\
                            <i class="fas fa-arrows-alt-h pitch-icon"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="0" min="-7" max="7" title="Adjust pitch">\
                        </div>\
                    </li>\
                    <li class="talkify-cc-button">\
                        <button class="modern-talkify-control-center-accent"\
                            title="Toggle text highlighting">\
                            <i class="fa fa-closed-captioning"></i>\
                        </button>\
                        <div>Text highlighting</div>\
                    </li>\
                    <li class="talkify-text-interaction-button">\
                        <button class="modern-talkify-control-center-accent" title="Toggle text interaction">\
                            <i class="fas fa-hand-point-up"></i>\
                        </button>\
                        <div>Text interaction</div>\
                    </li>\
                    <li class="talkify-enhanced-visibility-button">\
                        <button class="modern-talkify-control-center-accent" title="Toggle enhanced visibility">\
                            <i class="fas fa-eye"></i>\
                        </button>\
                        <div>Enhanced visibility</div>\
                    </li>\
                    <li class="talkify-detached talkify-rate-button">\
                        <button class="modern-talkify-control-center-accent" title="Adjust playback rate">\
                            <i class="fas fa-tachometer-alt"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="5" min="0" max="10" title="Adjust playback rate">\
                        </div>\
                    </li>\
                    <li class="talkify-detached talkify-volume-button">\
                        <button class="modern-talkify-control-center-accent" title="Adjust playback volume">\
                            <i class="fas fa-volume-up"></i>\
                        </button>\
                        <div class="detached-volume-slider">\
                            <input type="range" value="10" min="0" max="10" title="Adjust playback volume">\
                        </div>\
                    </li>\
                    <li class="talkify-detached talkify-attach-handle">\
                        <button class="modern-talkify-control-center-accent" title="Attach player">\
                            <i class="fa fa-window-minimize"></i>\
                        </button>\
                        <div>Dock player</div>\
                    </li>\
                </ul>\
            </div>\
        </li>\
        <li class="talkify-playback-controls">\
            <button class="talkify-rate-button talkify-attached" title="Rate of speech">\
                <i class="fa fa-tachometer-alt"></i>\
                <div class="rate-slider">\
                    <input type="range" value="5" min="0" max="10" title="Adjust playback rate">\
                </div>\
            </button>\
            <button class="talkify-step-backward-button" title="Previous">\
                <i class="fa fa-step-backward"></i>\
            </button>\
            <button class="talkify-play-button" title="Play">\
                <i class="fa fa-play"></i>\
            </button>\
            <button class="talkify-audio-loading"></button>\
            <button class="talkify-pause-button" title="Pause">\
                    <i class="fa fa-pause"></i>\
            </button>\
            <button class="talkify-audio-error" title="An error occurred at playback"><i class="fas fa-exclamation-triangle"></i></button>\
            <button class="talkify-step-forward-button" title="Next">\
                <i class="fa fa-step-forward"></i>\
            </button>\
            <button class="talkify-volume-button talkify-attached" title=" Volume">\
                <i class="fa fa-volume-up"></i>\
                <div class="volume-slider">\
                    <input type="range" value="10" min="0" max="10" title="Adjust playback volume">\
                </div>\
            </button>\
            \
        <li class="talkify-attached">\
            <div class="talkify-voice-selector ">\
                <label for="voice-selector-toggle">\
                <img class="talkify-selected-voice-flag talkify-flag talkify-hidden" src="">\
                <span></span>\
                </label><input type="checkbox" id="voice-selector-toggle" style="display: none;" />\
            </div>\
        </li>\
    </ul>\
</div>';
}
},{}],6:[function(require,module,exports){
/*
 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
 *  Licensed under the New BSD License.
 *  https://github.com/stackp/promisejs
 */

(function (exports) {

    function Promise() {
        this._callbacks = [];
    }

    Promise.prototype.then = function (func, context) {
        var p;
        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            this._callbacks.push(function () {
                var res = func.apply(context, arguments);
                if (res && typeof res.then === 'function')
                    res.then(p.done, p);
            });
        }
        return p;
    };

    Promise.prototype.done = function () {
        this.result = arguments;
        this._isdone = true;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }
        this._callbacks = [];
    };

    function join(promises) {
        var p = new Promise();
        var results = [];

        if (!promises || !promises.length) {
            p.done(results);
            return p;
        }

        var numdone = 0;
        var total = promises.length;

        function notifier(i) {
            return function () {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                if (numdone === total) {
                    p.done(results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    }

    function chain(funcs, args) {
        var p = new Promise();
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {
            funcs[0].apply(null, args).then(function () {
                funcs.splice(0, 1);
                chain(funcs, arguments).then(function () {
                    p.done.apply(p, arguments);
                });
            });
        }
        return p;
    }

    /*
     * AJAX requests
     */

    function _encode(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += '&' + e(k) + '=' + e(data[k]);
                }
            }
        }
        return result;
    }

    function new_xhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }


    function ajax(method, url, data, headers) {
        var p = new Promise();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = new_xhr();
        } catch (e) {
            p.done(promise.ENOXHR, "");
            return p;
        }

        payload = _encode(data);
        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);
        xhr.setRequestHeader('Content-type',
                             'application/x-www-form-urlencoded');
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        function onTimeout() {
            xhr.abort();
            p.done(promise.ETIMEOUT, "", xhr);
        }

        var timeout = promise.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function () {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = (!xhr.status ||
                           (xhr.status < 200 || xhr.status >= 300) &&
                           xhr.status !== 304);
                p.done(err, xhr.responseText, xhr);
            }
        };

        xhr.send(payload);
        return p;
    }

    function _ajaxer(method) {
        return function (url, data, headers) {
            return ajax(method, url, data, headers);
        };
    }

    var promise = {
        Promise: Promise,
        join: join,
        chain: chain,
        ajax: ajax,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        del: _ajaxer('DELETE'),

        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 0
    };

    if (typeof define === 'function' && define.amd) {
        /* AMD support */
        define(function () {
            return promise;
        });
    } else {
        exports.promise = promise;
    }

})(this);
},{}],7:[function(require,module,exports){
talkify = talkify || {};
talkify.http = (function ajax() {

    var get = function(url) {
        var call = new promise.promise.Promise();

        var keypart = (url.indexOf('?') !== -1 ? "&key=" : "?key=") + talkify.config.remoteService.apiKey;

        promise.promise
            .get(window.talkify.config.remoteService.host + url + keypart)
            .then(function(error, data) {
                try {
                    var jsonObj = JSON.parse(data);
                    call.done(error, jsonObj);
                } catch (e) {
                    call.done(e, data);
                }

            });

        return call;
    };

    return {
        get: get
    };
})();
},{}],8:[function(require,module,exports){
talkify = talkify || {};
talkify.config = {
    debug: false,
    useSsml: false,
    maximumTextLength: 5000,
    ui:
    {
        audioControls: {
            enabled: true,
            controlcenter: "native", //["classic", "modern", "local", "native"]
            container: document.body,
            voicepicker: {
                enabled: true, //where applicable
                filter: {
                    byClass: [], //example: ["Standard", "Premium", "Exclusive"]
                    byCulture: [], //example: ["en-EN", "en-AU"]
                    byLanguage: [] //example: ["English", "Spanish"]
                }
            }
        }
    },
    formReader: {
        voice: null,
        rate: 0,
        remoteService: true,
        requiredText: "This field is required",
        valueText: "You have entered {value} as: {label}.",
        selectedText: "You have selected {label}.",
        notSelectedText: "{label} is not selected."
    },
    remoteService: {
        active: true,
        host: 'https://talkify.net',
        apiKey: '',
        speechBaseUrl: '/api/speech/v2',
        languageBaseUrl: '/api/language/v1'
    },
    keyboardCommands: {
        enabled: false,
        commands: {
            playPause: 32,
            next: 39,
            previous: 37
        }
    },
    voiceCommands: {
        enabled: false,
        keyboardActivation: {
            enabled: true,
            key: 77
        },
        commands: {
            playPause: ["play", "pause", "stop", "start"],
            next: ["play next", "next"],
            previous: ["play previous", "previous", "back", "go back"]
        }
    }
}
},{}],9:[function(require,module,exports){
talkify = talkify || {};

talkify.formReader = function () {
    var player;
    var timeout;

    function setupForm(formElement) {
        var elements = formElement.elements;

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener("focus", onFocus);
        }
    }

    function removeForm(formElement) {
        var elements = formElement.elements;

        for (var i = 0; i < elements.length; i++) {
            elements[i].removeEventListener("focus", onFocus);
        }
    }

    function onFocus(e) {
        if (timeout) {
            clearTimeout(timeout);
        }

        var me = this;

        timeout = setTimeout(function () {
            if (!player) {
                player = talkify.config.formReader.remoteService ? new talkify.TtsPlayer() : new talkify.Html5Player();
            }

            var config = talkify.config.formReader;

            if (config.voice) {
                player.forceVoice({ name: config.voice });
            }

            player.setRate(config.rate);

            if (me.type === "button" || me.type === "submit") {
                player.playText(me.value || me.innerText);
                return;
            }

            var requiredText = me.attributes.required ? config.requiredText : "";

            var label = findLabelFor(me);

            var text = getTextForCheckboxes(me, label) || getTextForSelects(me, label) || getTextForInputs(me, label) || "";

            player.playText(text + ". " + requiredText);
        }, 100);
    }

    function getTextForCheckboxes(element, label) {
        var config = talkify.config.formReader;

        if (element.type === "checkbox") {
            var labelText = label ? label.innerText : "checkbox";

            if (element.checked) {
                return config.selectedText.replace("{label}", labelText);
            } else {
                return config.notSelectedText.replace("{label}", labelText);
            }
        }

        return null;
    }

    function getTextForSelects(element, label) {
        var config = talkify.config.formReader;

        if (element.tagName.toLowerCase() === "select") {
            var labelText = label ? label.innerText : "option";

            var value = element.options[element.options.selectedIndex].text;

            return config.valueText.replace("{value}", value).replace("{label}", labelText);
        }

        return null;
    }

    function getTextForInputs(element, label) {
        var config = talkify.config.formReader;

        if (!label) {
            return element.value;
        }

        if (element.value) {
            return config.valueText.replace("{value}", element.value).replace("{label}", label.innerText);
        } else {
            return label.innerText + ".";
        }
    }

    function findLabelFor(input) {
        var labels = document.getElementsByTagName('label');
        for (var i = 0; i < labels.length; i++) {
            if (labels[i].htmlFor === input.id) {
                return labels[i];
            }
        }

        return null;
    }

    return {
        addForm: function (formElement) {
            setupForm(formElement);
        },
        removeForm: function(formElement) {
            removeForm(formElement);
        }
    };
}();
},{}],10:[function(require,module,exports){
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
        var p = new promise.promise.Promise();

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
},{}],11:[function(require,module,exports){
talkify = talkify || {};

talkify.KeyboardCommands = function (keyboadCommands) {
    if (!keyboadCommands.enabled) {
        return {
            onPrevious: function () { },
            onNext: function () { },
            onPlayPause: function () { },
            dispose: function () { }
        }
    }


    var onNextCallback = function () { };
    var onPreviousCallback = function () { };
    var onPlayPauseCallback = function () { };

    document.addEventListener("keyup", keyupEventHandler);

    function keyupEventHandler(e) {
        if (!e.ctrlKey) {
            return;
        }

        var key = e.keyCode ? e.keyCode : e.which;

        if (key === keyboadCommands.commands.previous) {
            onPreviousCallback();
        } else if (key === keyboadCommands.commands.next) {
            onNextCallback();
        } else if (key === keyboadCommands.commands.playPause) {
            onPlayPauseCallback();
        }
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
        dispose: function () {
            document.removeEventListener("keyup", keyupEventHandler);
        }
    }
};
},{}],12:[function(require,module,exports){
talkify = talkify || {};
talkify.messageHub = function () {
    var subscribers = {};

    function publish(topic, message) {
        if (topic.indexOf("timeupdate") === -1) {
            talkify.log("Publishing", topic);
        }

        var topics = topic.split('.');
        var candidates = [];

        Object.keys(subscribers).forEach(function (subscriberKey) {
            if(subscriberKey === '*'){
                candidates.push(subscriberKey);
                return;
            }

            var s = subscriberKey.split('.');

            if (s.length != topics.length) {
                return;
            }

            var match = true;

            for (var i = 0; i < s.length; i++) {
                if (topics[i] === '*') {
                    match = true;
                }
                else if (s[i] === topics[i]) {
                    match = true;
                } else if (s[i] === "*") {
                    match === true;
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                candidates.push(subscriberKey);
            }
        });

        if (candidates.length === 0) {
            console.warn("No subscriber found", topic)
        }

        candidates.forEach(function (c) {
            subscribers[c].forEach(function (subscriber) {
                if (c.indexOf("timeupdate") === -1) {
                    talkify.log("Calling subscriber", subscriber, c, message);
                }

                subscriber.fn(message, topic);
            });
        })

    }

    function subscribe(key, topic, fn) {
        topic = Array.isArray(topic) ? topic : [topic];

        for (var i = 0; i < topic.length; i++) {
            subscribers[topic[i]] = subscribers[topic[i]] || [];

            subscribers[topic[i]].push({ key: key, fn: fn });
        }
    }

    function unsubscribe(key, topic) {
        topic = Array.isArray(topic) ? topic : [topic];

        talkify.log("Unsubscribing", key, topic);

        Object.keys(subscribers).filter(function (subscriberKey) {
            return topic.indexOf(subscriberKey) > -1 ;
        }).forEach(function (subscriberKey) {
            subscribers[subscriberKey] = subscribers[subscriberKey].filter(function (subscriber) {
                return subscriber.key !== key;
            });
        });
    }

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    }
}();
},{}],13:[function(require,module,exports){
talkify = talkify || {};
talkify.BasePlayer = function (_audiosource, _playbar, options) {
    this.correlationId = talkify.generateGuid();
    talkify.messageHub.publish(this.correlationId + ".player.*.creating");

    options = options || {};
    options.controlcenter = options.controlcenter || {};

    this.audioSource = _audiosource;
    this.wordHighlighter = new talkify.wordHighlighter(this.correlationId);

    var me = this;

    this.settings = {
        useTextHighlight: false,
        referenceLanguage: { Culture: "", Language: -1 },
        lockedLanguage: null,
        rate: 1
    };

    this.playbar = _playbar;
    this.forcedVoice = null;

    if (talkify.config.ui.audioControls.enabled) {
        this.playbar.instance = talkify.playbar(options.controlcenter.container, this.correlationId, options.controlcenter.name);
    }

    //Does infact prevent the usage of 2 simultanous players (which is not supported anyway)
    talkify.messageHub.subscribe("core-player", "*.player.*.creating", function () {
        me.dispose();
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.loaded", function (item) {
        item.isLoading = false;
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".player.*.ended", function (item) {
        item.isPlaying = false;
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".controlcenter.texthighlightoggled", function (enabled) {
        me.settings.useTextHighlight = enabled;
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".controlcenter.request.setvoice", function (voice) {
        me.forceVoice(voice);
    });

    talkify.messageHub.subscribe("core-player", this.correlationId + ".controlcenter.request.enhancedvisibility", function (value) {
        talkify.messageHub.publish(me.correlationId + ".player.*.enhancedvisibilityset", value);
    });

    talkify.messageHub.publish(this.correlationId + ".player.*.ratechanged", me.settings.rate);
    talkify.messageHub.publish(this.correlationId + ".player.*.enhancedvisibilityset", false);

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
        var safeMaxQuerystringLength = window.talkify.config.maximumTextLength || 1000;

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
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".controlcenter.request.setvoice");
        talkify.messageHub.unsubscribe("core-player", this.correlationId + ".controlcenter.request.enhancedvisibility");
        talkify.messageHub.unsubscribe("core-player", "*.player.*.creating");
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

    this.enableEnhancedTextVisibility = function () {
        talkify.messageHub.publish(this.correlationId + ".player.*.enhancedvisibilityset", true);
    }

    this.disableEnhancedTextVisibility = function () {
        talkify.messageHub.publish(this.correlationId + ".player.*.enhancedvisibilityset", false);
    }
};
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
talkify = talkify || {};
talkify.playlist = function () {
    var defaults = {
        useGui: false,
        useTextInteraction: false,
        domElements: [],
        exclusions: [],
        rootSelector: "body",
        events: {
            onEnded: null,
            onVoiceCommandListeningStarted: null,
            onVoiceCommandListeningEnded: null
        }
    };

    var s = JSON.parse(JSON.stringify(defaults));

    var p = null;

    function isSupported() {
        var a = document.createElement("audio");

        return (typeof a.canPlayType === "function" && (a.canPlayType("audio/mpeg") !== "" || a.canPlayType("audio/wav") !== ""));
    }

    function implementation(_settings, player) {
        var textextractor = new talkify.textextractor();

        var playlist = {
            queue: [],
            currentlyPlaying: null,
            refrenceText: "",
            referenceLanguage: { Culture: '', Language: -1 }
        };

        var settings = _settings;
        var playerHasBeenReplaced = false;

        var commands = [
            new talkify.KeyboardCommands(talkify.config.keyboardCommands),
            new talkify.SpeechCommands(talkify.config.voiceCommands)
        ];

        var voiceCommands = commands[1];

        for (var k = 0; k < commands.length; k++) {
            commands[k].onNext(playNext);
            commands[k].onPrevious(playPrevious);
            commands[k].onPlayPause(function () {
                if (player.paused()) {
                    player.play();
                } else {
                    pause();
                }
            });
        }

        voiceCommands.onListeningStarted(settings.events.onVoiceCommandListeningStarted);
        voiceCommands.onListeningEnded(settings.events.onVoiceCommandListeningEnded);

        setupHubSubscribers();

        function setupHubSubscribers() {
            talkify.messageHub.subscribe("playlist", player.correlationId + ".player.*.ended", function (endedItem) {
                if (playlist.queue.indexOf(endedItem) === -1) {
                    return;
                }

                var item = getNextItem();

                if (!item) {
                    settings.events.onEnded();
                    resetPlaybackStates();
                    return;
                }

                playItem(item);
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".player.*.unplayable", function () {
                if (playlist.currentlyPlaying) {
                    playItem(playlist.currentlyPlaying);
                    return;
                }

                playFromBeginning();
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled", function (enabled) {
                if (enabled) {
                    enableTextInteraction();
                } else {
                    disableTextInteraction();
                }
            });

            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.playnext", playNext);
            talkify.messageHub.subscribe("playlist", player.correlationId + ".controlcenter.request.playprevious", playPrevious);
        }

        function playNext() {
            var item = getNextItem();

            if (!item) {
                return;
            }

            playItem(item);
        }

        function playPrevious() {
            var item = getPreviousItem();

            if (!item) {
                return;
            }

            playItem(item);
        }

        function reset() {
            playlist.queue = [];
            player.withReferenceLanguage({ Culture: '', Language: -1 });
            playlist.currentlyPlaying = null;
            playlist.refrenceText = "";
        }

        function insertAt(index, items) {
            playlist.queue = playlist.queue.slice(0, index)
                .concat(items)
                .concat(playlist.queue.slice(index));
        }

        function push(items) {
            playlist.queue = playlist.queue.concat(items);
        }

        function resetPlaybackStates() {
            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                //TODO: Call player.resetItem?
                item.isPlaying = false;
                item.isLoading = false;
                item.element.classList.remove("playing");
            }
        };

        function isPlaying() {
            for (var i = 0; i < playlist.queue.length; i++) {
                if (playlist.queue[i].isPlaying) {
                    return true;
                }
            }

            return false;
        }

        function domElementExistsInQueue(element) { //TODO: might need to look at construct as <a><h3></h3></a> and whether "a" is "h3" since it is just a wrapper
            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                if (!item) {
                    continue;
                }

                if (element === item.element) {
                    return true;
                }
            }

            return false;
        }

        function playItem(item) {
            if (!playerHasBeenReplaced && item && item.isPlaying) {
                if (player.paused()) {
                    player.play();
                } else {
                    player.pause();
                }
            }

            playerHasBeenReplaced = false;

            resetPlaybackStates();

            if (playlist.currentlyPlaying) {
                playlist.currentlyPlaying.element.innerHTML = playlist.currentlyPlaying.originalElement.innerHTML;
            }

            playlist.currentlyPlaying = item;

            var previous = getPreviousItem();
            var next = getNextItem();

            talkify.messageHub.publish(player.correlationId + ".playlist.playing", { isFirst: !previous, isLast: !next });

            p = player.playItem(item);
        };

        function createItems(text, ssml, element) {
            var safeMaxQuerystringLength = window.talkify.config.maximumTextLength || 1000;

            var items = [];

            if (text.length > safeMaxQuerystringLength) {
                var chuncks = getSafeTextChunks(text, safeMaxQuerystringLength);

                element.innerHTML = '';

                for (var i = 0; i < chuncks.length; i++) {
                    var p = document.createElement("p");
                    p.textContent = chuncks[i];

                    element.appendChild(p);

                    items.push(template(chuncks[i], null, p));
                }

                return items;
            }

            items.push(template(text, ssml, element));

            return items;

            function template(t, s, el) {
                el = el || document.createElement("span");
                var clone = el.cloneNode(true);

                var wordbreakms = el.getAttribute("data-talkify-wordbreakms");
                var whisper = el.getAttribute("data-talkify-whisper");
                var phonation = el.getAttribute("data-talkify-phonation");
                var voice = el.getAttribute("data-talkify-voice") || null;
                var pitch = el.getAttribute("data-talkify-pitch") || null;
                var rate = el.getAttribute("data-talkify-rate") || null;

                return {
                    text: t,
                    ssml: s,
                    preview: t.substr(0, 40),
                    element: el,
                    originalElement: clone,
                    isPlaying: false,
                    isLoading: false,
                    wordbreakms: wordbreakms ? parseInt(wordbreakms) : null,
                    whisper: whisper ? whisper === "true" : null,
                    soft: phonation ? phonation === "soft" : null,
                    voice: voice,
                    pitch: pitch ? parseInt(pitch) : null,
                    rate: rate ? parseInt(rate) : null
                };
            }
        }

        function getSafeTextChunks(text, safeMaxQuerystringLength) {
            var chuncks = [];
            var remaining = text;

            var chunck = getNextChunck(text, safeMaxQuerystringLength);
            chuncks.push(chunck);

            while (chunck) {
                remaining = remaining.replace(chunck, "");

                chunck = getNextChunck(remaining, safeMaxQuerystringLength);

                if (chunck) {
                    chuncks.push(chunck);
                }
            }

            return chuncks;
        }

        function getNextChunck(text, safeMaxQuerystringLength) {
            if (!text) {
                return null;
            }

            if (text.length < safeMaxQuerystringLength) {
                return text;
            }

            var breakAt = text.substr(0, safeMaxQuerystringLength).lastIndexOf('.');
            breakAt = breakAt > -1 ? breakAt : text.substr(0, safeMaxQuerystringLength).lastIndexOf('。');
            breakAt = breakAt > -1 ? breakAt : safeMaxQuerystringLength;

            return text.substr(0, breakAt + 1);
        }

        function play(item) {
            if (!item) {
                if (playlist.queue.length === 0) {
                    return;
                }

                playFromBeginning();

                return;
            }

            playItem(item);
        }

        function pause() {
            player.pause();
        }

        function setupItemForUserInteraction(item) {
            item.element.style.cursor = "pointer";
            item.element.classList.add("talkify-highlight");

            removeEventListeners("click", item.element);
            addEventListener("click", item.element, textInteractionEventListener);

            function textInteractionEventListener() {
                play(item);
            }
        }

        function removeUserInteractionForItem(item) {
            item.element.style.cursor = "inherit";
            item.element.classList.remove("talkify-highlight");

            removeEventListeners("click", item.element);
        }

        function initialize() {
            reset();

            if (!settings.domElements || settings.domElements.length === 0) {
                settings.domElements = textextractor.extract(settings.rootSelector, settings.exclusions);
            }

            for (var i = 0; i < settings.domElements.length; i++) {
                var text, ssml;
                var element = null;

                if (typeof settings.domElements[i] === "string") {
                    text = settings.domElements[i];
                } else {
                    element = settings.domElements[i];

                    ssml = convertToSsml(element);

                    text = element.innerText.trim();
                }

                if (text === "") {
                    continue;
                }

                push(createItems(text, ssml, element));

                if (text.length > playlist.refrenceText.length) {
                    playlist.refrenceText = text;
                }
            }

            if (settings.useTextInteraction) {
                for (var j = 0; j < playlist.queue.length; j++) {
                    var item = playlist.queue[j];

                    if (j > 0) {
                        var isSameAsPrevious = item.element === playlist.queue[j - 1].element;

                        if (isSameAsPrevious) {
                            continue;
                        }
                    }

                    setupItemForUserInteraction(item);
                }
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.loaded");

            if (settings.useTextInteraction) {
                talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.enabled");
            } else {
                talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.disabled");
            }
        }

        function convertToSsml(element) {
            if (!talkify.config.useSsml) {
                return null;
            }

            var ssmlMappings = {
                h1: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                h2: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                h3: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                b: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                strong: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                em: {
                    start: '###emphasis level="strong">',
                    end: '###/emphasis>',
                    trim: false
                },
                i: {
                    start: '###emphasis level="reduced">',
                    end: '###/emphasis>',
                    trim: false
                },
                br: {
                    start: '###break strength="x-strong">###/break>',
                    end: '',
                    trim: true
                }
            };

            var htmlEntities = {};
            htmlEntities["&nbsp;"] = " ";
            htmlEntities["&lt;"] = "<";
            htmlEntities["&gt;"] = ">";
            htmlEntities["&qout;"] = "\"";
            htmlEntities["&apos;"] = "'";
            htmlEntities["&amp;"] = "&";

            var ssml = element.innerHTML.replace(/ +/g, " ").replace(/(\r\n|\n|\r)/gm, "").trim();

            for (var key in htmlEntities) {
                ssml = ssml.replace(new RegExp(key, 'g'), htmlEntities[key]);
            }

            for (var key in ssmlMappings) {
                var mapping = ssmlMappings[key];

                var startTagMatches = ssml.match(new RegExp('<' + key + '+(>|.*?[^?]>)', 'gi')) || [];

                for (var j = 0; j < startTagMatches.length; j++) {
                    if (startTagMatches[j] !== '<' + key + '>' && startTagMatches[j].indexOf('<' + key + ' ') !== 0) {
                        continue;
                    }

                    ssml = ssml.replace(startTagMatches[j], mapping.start);

                    if (mapping.trim) {
                        ssml = ssml.split(mapping.start).map(function (x) { return x.trim() }).join(mapping.start);
                    }
                }

                ssml = ssml.split('</' + key + '>').map(function (x, i) { return mapping.trim ? x.trim() : x; }).join(mapping.end);
            }

            ssml = ssml.replace(/<[^>]*>?/gm, ''); //removes html-tags
            ssml = ssml.replace(/\s+/g, ' '); //removes multiple whitespaces
            ssml = ssml.split('###').join('<');

            return ssml;
        }

        function getNextItem() {
            var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

            if (currentQueuePosition === playlist.queue.length - 1) {
                return null;
            }

            return playlist.queue[currentQueuePosition + 1];
        }

        function getPreviousItem() {
            var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

            if (currentQueuePosition === 0) {
                return null;
            }

            return playlist.queue[currentQueuePosition - 1];
        }

        function playFromBeginning() {
            if (!talkify.config.remoteService.active || !hasTalkifyPlayer()) {
                onComplete({ Cultures: [], Language: -1 });

                return;
            }

            var text = playlist.refrenceText.length <= 1000 ? playlist.refrenceText : playlist.refrenceText.substr(0, 1000);

            talkify.http.get(talkify.config.remoteService.languageBaseUrl + "/detect?text=" + text)
                .then(function (error, data) {
                    if (error) {
                        onComplete({ Cultures: [], Language: -1 });

                        return;
                    }

                    onComplete(data);
                });

            function onComplete(refLang) {
                playlist.referenceLanguage = { Culture: refLang.Cultures[0], Language: refLang.Language };
                player.withReferenceLanguage(playlist.referenceLanguage);

                playItem(playlist.queue[0]);
            }
        }

        function hasTalkifyPlayer(voice) {
            return player instanceof talkify.TtsPlayer;
        }

        function insertElement(element) {
            var items = [];

            var text = element.innerText;

            if (text.trim() === "") {
                return items;
            }

            if (domElementExistsInQueue(element)) {
                return items;
            }

            var documentPositionFollowing = 4;

            for (var j = 0; j < playlist.queue.length; j++) {
                var item = playlist.queue[j];

                var isSelectionAfterQueueItem = element.compareDocumentPosition(item.element) == documentPositionFollowing;

                if (isSelectionAfterQueueItem) {
                    var queueItems = createItems(text, null, element);

                    insertAt(j, queueItems);

                    items = items.concat(queueItems);

                    break;
                }

                var shouldAddToBottom = j === playlist.queue.length - 1;

                if (shouldAddToBottom) {
                    var qItems = createItems(text, null, element);

                    push(qItems);

                    items = items.concat(qItems);

                    break;;
                }
            }

            return items;
        }

        function replayCurrent() {
            if (!playlist.currentlyPlaying) {
                return;
            }

            playlist.currentlyPlaying.isPlaying = false;
            play(playlist.currentlyPlaying);
        }

        //TODO: Extract and reuse?
        function removeEventListeners(eventType, element) {
            if (!element.trackedEvents || !element.trackedEvents[eventType]) {
                return;
            }

            for (var i = 0; i < element.trackedEvents[eventType].length; i++) {
                element.removeEventListener(eventType, element.trackedEvents[eventType][i]);
            }
        }

        function addEventListener(eventType, element, listener) {
            if (!element.trackedEvents) {
                element.trackedEvents = [];
            }

            if (!element.trackedEvents[eventType]) {
                element.trackedEvents[eventType] = [];
            }

            element.trackedEvents[eventType].push(listener);
            element.addEventListener(eventType, listener);
        }

        function enableTextInteraction() {
            settings.useTextInteraction = true;

            for (var i = 0; i < playlist.queue.length; i++) {
                setupItemForUserInteraction(playlist.queue[i]);
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.enabled");
        }

        function disableTextInteraction() {
            settings.useTextInteraction = false;

            for (var i = 0; i < playlist.queue.length; i++) {
                removeUserInteractionForItem(playlist.queue[i]);
            }

            talkify.messageHub.publish(player.correlationId + ".playlist.textinteraction.disabled");
        }

        initialize();

        return {
            getQueue: function () { return playlist.queue; },
            play: play,
            pause: pause,
            replayCurrent: replayCurrent,
            insert: insertElement,
            isPlaying: isPlaying,
            enableTextInteraction: enableTextInteraction,
            disableTextInteraction: disableTextInteraction,
            setPlayer: function (p) {
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.*.ended");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.tts.unplayable");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playnext");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playprevious");

                player = p;
                player.withReferenceLanguage(playlist.referenceLanguage);
                playerHasBeenReplaced = true;

                setupHubSubscribers();

                replayCurrent();
            },
            dispose: function () {
                resetPlaybackStates();

                for (var i = 0; i < playlist.queue.length; i++) {
                    var item = playlist.queue[i];

                    removeUserInteractionForItem(item);
                }

                for (var i = 0; i < commands.length; i++) {
                    commands[i].dispose();
                }

                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.*.ended");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".player.tts.unplayable");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.textinteractiontoggled");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playnext");
                talkify.messageHub.unsubscribe("playlist", player.correlationId + ".controlcenter.request.playprevious");
            },
            startListeningToVoiceCommands: function () {
                voiceCommands.start();
            },
            stopListeningToVoiceCommands: function () {
                voiceCommands.stop();
            }
        }
    }

    return {
        begin: function () {
            s = JSON.parse(JSON.stringify(defaults));
            p = null;

            return {
                withTextInteraction: function () {
                    s.useTextInteraction = true;

                    return this;
                },
                withTalkifyUi: function () {
                    s.useGui = true;

                    return this;
                },
                excludeElements: function (elementsSelectors) {
                    s.exclusions = elementsSelectors;

                    return this;
                },
                withRootSelector: function (rootSelector) {
                    s.rootSelector = rootSelector;

                    return this;
                },
                withElements: function (elements) {
                    s.domElements = elements;

                    return this;
                },
                usingPlayer: function (player) {
                    p = player;

                    return this;
                },
                subscribeTo: function (events) {
                    s.events.onEnded = events.onEnded || function () { };
                    s.events.onVoiceCommandListeningStarted = events.onVoiceCommandListeningStarted || function () { };
                    s.events.onVoiceCommandListeningEnded = events.onVoiceCommandListeningEnded || function () { };


                    return this;
                },
                build: function () {
                    if (!isSupported()) {
                        throw new Error("Not supported. The browser needs to support mp3 or wav HTML5 Audio.");
                    }

                    if (!p) {
                        throw new Error("A player must be provided. Please use the 'usingPlayer' method to provide one.");
                    }

                    s.events.onEnded = s.events.onEnded || function () { };
                    s.events.onVoiceCommandListeningStarted = s.events.onVoiceCommandListeningStarted || function () { };
                    s.events.onVoiceCommandListeningEnded = s.events.onVoiceCommandListeningEnded || function () { };

                    return new implementation(s, p);
                }
            }
        }

    };
};
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
talkify = talkify || {};

talkify.selectionActivator = function () {
    var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'];
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'style', 'code', 'rp', 'rt'];
    var timeoutId, playlist, player, x, y, activatorHtml, controlcenterHtml, currentSelection;
    var orchestrateTimeout;
    var activated = false;
    var currentContext = {};
    var settings = {
        exclude: [],
        enhancedVisibility: false,
        voice: { name: 'Zira' },
        highlightText: false,
        buttonText: "Listen"
    };

    var validNodeTypes = [1, 3];

    function getElementsInSelection() {
        if (!currentSelection) {
            return [];
        }

        var anchorNode = currentContext.anchorNode;

        if (!anchorNode) {
            return [];
        }

        var nodes = getNodesInSelection(currentContext.range.commonAncestorContainer, currentContext.leftToRight);

        return nodes;
    }

    function createItemsFromNodes(nodes) {
        var items = [];

        if (nodes.length === 1) {
            return [surroundNode(nodes[0], currentContext.range.startOffset, currentContext.range.endOffset)];
        }

        for (var i = 0; i < nodes.length; i++) {
            if (i === 0) {
                if (currentContext.leftToRight) {
                    items.push(surroundNode(nodes[i], currentContext.anchorOffset, currentContext.anchorNode.textContent.length))
                } else {
                    items.push(surroundNode(nodes[i], currentContext.focusOffset, currentContext.focusNode.textContent.length))
                }

                continue;
            }

            if (i === nodes.length - 1) {
                if (currentContext.leftToRight) {
                    items.push(surroundNode(nodes[i], 0, currentContext.focusOffset))
                }
                else {
                    items.push(surroundNode(nodes[i], 0, currentContext.anchorOffset))
                }

                continue;
            }

            items.push(surroundNode(nodes[i], 0, 0))
        }

        return items;
    }

    function getNodesInSelection(element, leftToRight) {
        if (element === document.body.parentElement) {
            return [];
        }

        var nodes = getNodesInBetween(element, leftToRight);

        if (!leftToRight) {
            nodes.reverse();
        }

        return nodes;
    }

    function getNodesInBetween(element, leftToRight) {
        var nodes = [];

        if (element.nodeType === 3) {
            return [element];
        }

        var inlineGroups = getInlineGroups(element.childNodes);

        for (var i = 0; i < element.childNodes.length; i++) {
            var node = leftToRight ?
                element.childNodes[i] :
                element.childNodes[element.childNodes.length - 1 - i];

            var tagName = node.tagName != undefined ? node.tagName.toLowerCase() : undefined;

            if (forbiddenElementsString.indexOf(tagName) !== -1 || settings.exclude.indexOf(node) !== -1) {
                continue;
            }

            if (validNodeTypes.indexOf(node.nodeType) === -1) {
                continue;
            }

            if (node.textContent.trim() === "") {
                continue;
            }

            var group = inlineGroups.filter(function (x) { return x.indexOf(node) > -1; })[0];

            if (group) {
                nodes.push(group);

                var indexAfterGroup = i + group.length;
                i = indexAfterGroup;

                continue;
            }

            if (node.nodeType === 1) {
                nodes = nodes.concat(getNodesInBetween(node, leftToRight));
            }

            if (node.nodeType === 1) {
                continue;
            }

            if (currentSelection.containsNode(node, true)) {
                nodes.push(node);
            }
        }

        return nodes;
    }

    function getInlineGroups(nodes) {
        var groups = [];

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if (!currentSelection.containsNode(node, true)) {
                continue;
            }

            var isBlockElement = node.nodeType === 1 && inlineElements.indexOf(node.tagName.toLowerCase()) === -1;

            if (isBlockElement) {
                continue;
            }

            if (validNodeTypes.indexOf(node.nodeType) === -1) {
                continue;
            }

            if (node.textContent.trim() === "") {
                continue;
            }

            var group = [node];

            while (i < nodes.length &&
                node.nextSibling &&
                node.nextSibling.textContent.trim() !== "" &&
                currentSelection.containsNode(node.nextSibling, true) &&
                (node.nextSibling.nodeType === 3 || inlineElements.indexOf((node.nextSibling.tagName || "").toLowerCase()) !== -1)) {
                group.push(node.nextSibling);

                i++;
                node = nodes[i];
            }

            if (group.length > 1) {
                groups.push(group);
            }
        }

        return groups;
    }

    function surroundNode(node, startOffset, endOffset) {
        var range = document.createRange();
        var newParent = document.createElement('span');
        newParent.classList.add("talkify-selected-text");

        if (Array.isArray(node)) {
            var originalNodes = [];
            node[0].parentNode.insertBefore(newParent, node[0]);

            for (var i = 0; i < node.length; i++) {
                newParent.appendChild(node[i].cloneNode(true));

                originalNodes.push(node[i].cloneNode(true));

                node[i].parentNode.removeChild(node[i]);
            }

            return {
                newNode: newParent,
                originalNode: originalNodes
            };
        }

        var original = node.cloneNode(true);

        if (node.nodeType === 1) {
            node.classList.add("talkify-selected-text");

            return {
                newNode: node,
                originalNode: original
            };
        }

        if (startOffset === 0 && endOffset === 0) {
            range.setStart(node, 0);
            range.setEnd(node, node.textContent.length);
            range.surroundContents(newParent);
        } else {
            range.setStart(node, 0);
            range.setEnd(node, node.textContent.length);
            range.surroundContents(newParent);
        }

        return {
            originalNode: original,
            newNode: newParent
        };
    }

    function deactivate() {
        activated = false;

        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('keyup', onMouseUp, false);
    }

    function activate() {
        if (activated) {
            console.warn("Selection activator is already activated");
            return;
        }

        activated = true;

        if (settings.exclude && NodeList.prototype.isPrototypeOf(settings.exclude)) {
            settings.exclude = Array.from(settings.exclude);
        }

        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('keyup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseUpdate, false);
        document.addEventListener('mouseenter', onMouseUpdate, false);

        talkify.domExtensions.recordEvents.begin();
    }

    function onMouseUp(e) {
        currentSelection = window.getSelection();

        if (currentSelection.type === "Range" && currentSelection.toString().trim()) {
            if (currentContext.anchorNode === currentSelection.anchorNode && currentContext.focusNode === currentSelection.focusNode) {
                return;
            }

            if (activatorHtml && (activatorHtml.contains(currentSelection.focusNode) || activatorHtml.contains(currentSelection.anchorNode))) {
                return;
            }

            if (currentContext && currentContext.active) {
                return;
            }

            if (orchestrateTimeout) {
                clearTimeout(orchestrateTimeout);
            }

            orchestrateTimeout = setTimeout(orchestrateAfterSelection, 200);
        }
    }

    function orchestrateAfterSelection() {
        if (currentSelection.rangeCount === 0) {
            return;
        }

        removeActivator();

        currentContext = {
            anchorNode: currentSelection.anchorNode,
            focusNode: currentSelection.focusNode,
            anchorOffset: currentSelection.anchorOffset,
            focusOffset: currentSelection.focusOffset,
            range: currentSelection.getRangeAt(0),
            active: false,
            elements: []
        };

        var position = currentContext.anchorNode.compareDocumentPosition(currentContext.focusNode);
        currentContext.leftToRight = !(position & Node.DOCUMENT_POSITION_PRECEDING);

        currentContext.nodes = getElementsInSelection();

        console.log(currentContext.nodes);

        if (!currentContext.nodes.length) {
            currentContext = {};
            return;
        }

        renderActivator();

        activatorHtml.addEventListener('click', activateControlcenter, false);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(function () {
            removeActivator();
            currentContext = {};
        }, 2000);
    }

    function activateControlcenter() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        currentContext.active = true;

        currentContext.elements = createItemsFromNodes(currentContext.nodes);

        var elements = currentContext.elements.map(function (x) { return x.newNode; });

        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }

        renderControlcenter();
        removeActivator();

        player = new talkify.TtsPlayer({ controlcenter: { name: "local", container: controlcenterHtml } });

        talkify.messageHub.subscribe("text-selection-activator", player.correlationId + ".player.*.disposed", disposeControlCenter);

        if (settings.highlightText) {
            player.enableTextHighlighting();
        }

        player.forceVoice(settings.voice);

        if (settings.enhancedVisibility) {
            player.enableEnhancedTextVisibility();
        }

        if (playlist) {
            playlist.dispose();
        }

        playlist = new talkify.playlist()
            .begin()
            .usingPlayer(player)
            .withElements(elements)
            .subscribeTo({ onEnded: disposeControlCenter })
            .build();
    }

    function disposeControlCenter() {
        if (player) {
            talkify.messageHub.unsubscribe("text-selection-activator", player.correlationId + ".player.*.disposed");
            player.dispose();
        }

        if (playlist) {
            playlist.dispose();
        }

        removeControlcenter();

        if (currentContext.range.commonAncestorContainer.nodeType !== 1) {
            var element = currentContext.elements[0];

            if (element) {
                element.newNode.parentElement.replaceChild(element.originalNode, element.newNode);
            }
        }
        else {
            restoreDom();
        }

        currentContext = {};
    }

    function restoreDom() {
        var elements = currentContext.elements;

        for (var i = 0; i < elements.length; i++) {
            var originalNode = elements[i].originalNode;
            var currentNode = elements[i].newNode;

            if (Array.isArray(originalNode)) {
                restoreDomForGroupedNodes(currentNode, originalNode);
            }
            else {
                currentNode.parentElement.replaceChild(originalNode, currentNode);
            }

            var candidatesForEvents = Array.isArray(originalNode) ?
                originalNode.map(function (n) {
                    if (n.getElementsByTagName) {
                        return [n].concat(Array.from(n.getElementsByTagName('*')))
                    }

                    return [n];
                }).flat() :
                [originalNode].concat(originalNode.getElementsByTagName ? Array.from(originalNode.getElementsByTagName('*')) : [])

            var events = candidatesForEvents.map(function (x) {
                return talkify.domExtensions.recordEvents.getEvents(x);
            }).filter(function (x) { return x !== null });

            for (var j = 0; j < candidatesForEvents.length; j++) {
                var element = candidatesForEvents[j];

                var eventsToApply = events
                    .filter(function (x) { return element.isEqualNode(x.node) })
                    .map(function (x) { return x.events })
                    .flat();

                for (var k = 0; k < eventsToApply.length; k++) {
                    var event = eventsToApply[k];

                    element.addEventListener(event.type, event.listener, event.options);
                }
            }
        }
    }

    function restoreDomForGroupedNodes(currentNode, originalNodes) {
        for (var i = 0; i < originalNodes.length; i++) {
            var originalNode = originalNodes[i];
            currentNode.parentElement.insertBefore(originalNode, currentNode);
        }

        currentNode.parentElement.removeChild(currentNode);
    }

    function removeControlcenter() {
        if (!controlcenterHtml) {
            return;
        }

        controlcenterHtml.innerHTML = "";
        document.body.removeChild(controlcenterHtml);
        controlcenterHtml = null;
    }

    function removeActivator() {
        if (!activatorHtml) {
            return;
        }

        activatorHtml.removeEventListener("click", activateControlcenter, false);

        activatorHtml.innerHTML = "";

        if (activatorHtml.parentElement) {
            document.body.removeChild(activatorHtml);
        }

        activatorHtml = null;
    }

    function onMouseUpdate(e) {
        x = e.clientX;
        y = e.clientY;
    }

    function renderActivator() {
        var div = document.createElement('div');
        div.classList.add("talkify-activator-wrapper");

        div.innerHTML = '<div class="talkify-popup-activator">\
                            <button title="Talkify">\
                                <i class="fas fa-play"></i>' +
            settings.buttonText +
            '</button>\
                        </div>';

        activatorHtml = div;

        document.body.appendChild(activatorHtml);

        var preferDown = currentContext.leftToRight || y < 50;

        if (x >= window.outerWidth - 300) {
            x = x - (300 - (window.outerWidth - x));
        }

        activatorHtml.style.left = x + 'px';
        activatorHtml.style.top = (y + (preferDown ? 15 : -45)) + 'px';
    }

    function renderControlcenter() {
        controlcenterHtml = document.createElement('div');
        controlcenterHtml.classList.add("talkify-controlcenter-wrapper");

        var closeButton = document.createElement('div');
        closeButton.classList.add('talkify-close');

        closeButton.innerHTML = "<i class='fa fa-times'/>";

        closeButton.addEventListener("click", disposeControlCenter);

        controlcenterHtml.appendChild(closeButton);

        controlcenterHtml.style.left = activatorHtml.style.left;
        controlcenterHtml.style.top = activatorHtml.style.top;

        document.body.appendChild(controlcenterHtml);
    }

    return {
        withEnhancedVisibility: function () {
            settings.enhancedVisibility = true;
            return this;
        },
        withVoice: function (voice) {
            settings.voice = voice;
            return this;
        },
        withTextHighlighting: function () {
            settings.highlightText = true;
            return this;
        },
        withButtonText: function (text) {
            settings.buttonText = text;
            return this;
        },
        excludeElements: function (domElements) {
            settings.exclude = domElements;
            return this;
        },
        activate: activate,
        deactivate: deactivate
    }
}();

talkify.domExtensions = {
    recordEvents: function () {
        var events = [];
        var initialized = false;

        function addEventListenerDecorator(type, listener, options) {
            this._addEventListener(type, listener, options);

            events.push({ node: this, type: type, listener: listener, options: options });
        }

        function initialize() {
            if (initialized) {
                return;
            }

            Node.prototype._addEventListener = Node.prototype.addEventListener;
            Node.prototype.addEventListener = addEventListenerDecorator;
            initialized = true;
        }

        function getEvents(node) {
            var result = events.filter(function (e) {
                return e.node.isEqualNode(node);
            });

            if (!result.length) {
                return {
                    events: []
                };
            }

            return {
                node: result[0].node,
                events: result
            };
        }

        return {
            getEvents: getEvents,
            begin: initialize
        }
    }()
}


},{}],18:[function(require,module,exports){
talkify = talkify || {};
talkify.textextractor = function () {
    var validElements = [];

    var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'];
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'style', 'code', 'nav', '#nav', '#navigation', '.nav', '.navigation', 'footer', 'rp', 'rt']; //removed br...revert?
    var userExcludedElements = [];

    function getVisible(elements) {
        var result = [];

        for (var j = 0; j < elements.length; j++) {
            if (!isVisible(elements[j])) {
                continue;
            }

            result.push(validElements[j]);
        }

        return result;
    }

    function isVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    function getStrippedText(text) {
        return text.replace(/(\r\n|\n|\r)/gm, "").trim();
    }

    function isValidTextNode(node) {
        if (!node) {
            return false;
        }

        if (node.nodeType === 3) {
            return getStrippedText(node.textContent).length >= 10;
        }

        return false;
    }

    function isValidAnchor(node) {
        var nrOfSiblings = getSiblings(node);

        if (nrOfSiblings.length >= 1) {
            return true;
        }

        var previous = node.previousSibling;

        if (isValidTextNode(previous)) {
            return true;
        }

        if (isValidTextNode(node.nextSibling)) {
            return true;
        }

        return false;
    }

    function isValidForGrouping(node) {
        if(node.nodeName === "BR"){
            return true;
        }
        
        var isTextNode = node.nodeType === 3;
        var textLength = getStrippedText(node.textContent).length;

        return (isTextNode && textLength >= 2) || (!isForbidden(node) && elementIsInlineElement(node));
    }

    function getConnectedElements(nodes, firstIndex) {
        var connectedElements = [];

        for (var l = firstIndex; l < nodes.length; l++) {
            if (isValidForGrouping(nodes[l])) {
                connectedElements.push(nodes[l]);
            } else {
                break;
            }
        }

        return connectedElements;
    }

    function group(elements) {
        //TODO: wrap in selectable element
        wrapping = document.createElement('span');
        wrapping.classList.add("superbar");

        for (var j = 0; j < elements.length; j++) {
            wrapping.appendChild(elements[j].cloneNode(true));
        }

        return wrapping;
    }

    function wrapInSelectableElement(node) {
        wrapping = document.createElement('span');
        wrapping.classList.add("foobar");
        wrapping.innerText = node.textContent.trim();
        return wrapping;
    }

    function wrapAndReplace(node) {
        var spanElement = wrapInSelectableElement(node);

        if (node.parentNode) {
            node.parentNode.replaceChild(spanElement, node);
        }

        return spanElement;
    }

    function evaluate(nodes) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if (elementIsParagraphOrHeader(node)) {
                validElements.push(node);
                continue;
            }

            if (getForbiddenElements().indexOf(getSafeTagName(node).toLowerCase()) !== -1) {
                var forcedElement = (node.nodeType === 1 ? node : node.parentNode).querySelectorAll('h1, h2, h3, h4');

                for (var k = 0; k < forcedElement.length; k++) {
                    validElements.push(forcedElement[k]);
                }

                continue;
            }

            if (getSafeTagName(node).toLowerCase() === 'a' && !isValidAnchor(node)) {
                continue;
            }

            var connectedElements = getConnectedElements(nodes, i);

            if (connectedElements.length > 1) {
                var wrapping = group(connectedElements);
                var isAboveThreshold = getStrippedText(wrapping.innerText).length >= 20;

                if (isAboveThreshold) {
                    nodes[i].parentNode.replaceChild(wrapping, nodes[i]);

                    for (var j = 0; j < connectedElements.length; j++) {
                        var parentNode = connectedElements[j].parentNode;

                        if (!parentNode) {
                            continue;
                        }

                        connectedElements[j].parentNode.removeChild(connectedElements[j]);
                    }

                    validElements.push(wrapping);

                    continue;
                }
            }

            if (isValidTextNode(node)) {
                validElements.push(wrapAndReplace(node));
            }

            evaluate(node.childNodes);
        }
    }

    function extract(rootSelector, exclusions) {
        userExcludedElements = exclusions || [];
        validElements = [];

        var topLevelElements = document.querySelectorAll(rootSelector + ' > ' + generateExcludesFromForbiddenElements());

        for (var i = 0; i < topLevelElements.length; i++) {
            var element = topLevelElements[i];

            if (elementIsParagraphOrHeader(element)) {
                validElements.push(element);

                continue;
            }

            evaluate(topLevelElements[i].childNodes);
        }

        var result = getVisible(validElements);

        return result;
    }

    function generateExcludesFromForbiddenElements() {
        var result = '*';

        var forbiddenElements = getForbiddenElements();

        for (var i = 0; i < forbiddenElements.length; i++) {
            result += ':not(' + forbiddenElements[i] + ')';
        }

        return result;
    }

    function elementIsParagraphOrHeader(element) {
        if (element.nodeType === 3) {
            return false;
        }

        return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(getSafeTagName(element).toLowerCase()) != -1;
    }

    function elementIsInlineElement(element) {
        if (element.nodeType === 3) {
            return false;
        }

        return inlineElements.indexOf(getSafeTagName(element).toLowerCase()) != -1;
    }

    function getSafeTagName(node) {
        return node.tagName || '';
    }

    function getChildren(n, skipMe) {
        var r = [];
        for (; n; n = n.nextSibling)
            if (n.nodeType == 1 && n != skipMe && !isForbidden(n))
                r.push(n);
        return r;
    };

    function getSiblings(n) {
        if (!n) {
            return [];
        }

        return getChildren(n.parentNode.firstChild, n);
    }

    function getForbiddenElements() {
        return forbiddenElementsString.concat(userExcludedElements);
    }

    function isForbidden(node) {
        return getForbiddenElements().indexOf(getSafeTagName(node).toLowerCase()) !== -1;
    }

    return {
        extract: extract
    };
};
},{}],19:[function(require,module,exports){
talkify = talkify || {};

talkify.generateGuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

talkify.log = function(){
    if(talkify.config.debug){
        console.log.apply(console, arguments);
    }
}

talkify.toLowerCaseKeys = function(o) {
    var newO, origKey, newKey, value;
    if (o instanceof Array) {
      return o.map(function(value) {
          if (typeof value === "object") {
            value = talkify.toLowerCaseKeys(value);
          }
          return value;
      })
    } else {
      newO = {};
      for (origKey in o) {
        if (o.hasOwnProperty(origKey)) {
          newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
          value = o[origKey];
          if (value instanceof Array || (value !== null && value.constructor === Object)) {
            value = talkify.toLowerCaseKeys(value);
          }
          newO[newKey] = value;
        }
      }
    }
    return newO;
  }

},{}],20:[function(require,module,exports){
talkify = talkify || {};
talkify.wordHighlighter = function (correlationId) {
    var currentItem = null;
    var currentPositions = [];
    var currentPosition = -1;
    var currentWordbreakMs = 0;
    var useEnhancedView = false;
    var enhancedView = null;
    var currentControlcenterPosition = null;

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.seeked", setPosition);
    talkify.messageHub.subscribe("word-highlighter", [correlationId + ".player.tts.loading", correlationId + ".player.tts.disposed", correlationId + ".player.tts.ended"],
        function () {
            cancel();

            if (enhancedView) {
                document.body.removeChild(enhancedView);
                enhancedView = null;
            }
        });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.play", function (message) {
        setupWordHightlighting(message.item, message.positions);
    });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.wordbreakchanged", function (wordbreakms) {
        currentWordbreakMs = wordbreakms;
    });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.timeupdated", function (timeInfo) {
        if (!currentPositions.length) {
            return;
        }

        var time = timeInfo.currentTime * 1000;

        var currentPos = 0;

        if (time < currentPositions[0].Position) {
            if (currentPosition === 0) {
                return;
            }

            currentPosition = 0;
            highlight(currentItem, currentPositions[0].Word, currentPositions[0].CharPosition);
            return;
        }

        for (var i = 0; i < currentPositions.length; i++) {
            if (i === currentPositions.length - 1) {
                currentPos = i;
                break;
            }

            var position = currentPositions[i].Position;

            if (time >= position && time <= currentPositions[i + 1].Position) {
                currentPos = i;
                break;
            }
        }

        if (currentPosition === currentPos) {
            return;
        }

        currentPosition = currentPos;

        highlight(currentItem, currentPositions[currentPos].Word, currentPositions[currentPos].CharPosition);
    });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.enhancedvisibilityset", function (value) {
        useEnhancedView = value;

        if (!value && enhancedView) {
            document.body.removeChild(enhancedView);
            enhancedView = null;
        }
    });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".controlcenter.attached", function (position) {
        currentControlcenterPosition = position;

        adjustRenderPositionToControlCenter();
    });

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".controlcenter.detatched", function (position) {
        currentControlcenterPosition = position;

        adjustRenderPositionToControlCenter();
    });

    function adjustRenderPositionToControlCenter() {
        if (enhancedView && currentControlcenterPosition) {
            var enhancedViewPosition = enhancedView.getBoundingClientRect();

            var hasOverlay = enhancedViewPosition.y >= currentControlcenterPosition.y &&
                enhancedViewPosition.y <= (currentControlcenterPosition.y + currentControlcenterPosition.height);

            hasOverlay = hasOverlay || (currentControlcenterPosition.y >= enhancedViewPosition.y &&
                currentControlcenterPosition.y <= (enhancedViewPosition.y + enhancedViewPosition.height));

            if (hasOverlay) {
                enhancedView.style.bottom = currentControlcenterPosition.height + "px";
            } else {
                enhancedView.style.bottom = "";
            }
        }
    }

    function adjustPositionsToSsml(text, positions) {
        var internalPos = JSON.parse(JSON.stringify(positions));

        var lastFound = 0;

        for (var i = 0; i < internalPos.length; i++) {
            lastFound = text.indexOf(internalPos[i].Word, lastFound);
            internalPos[i].CharPosition = lastFound
        }

        return internalPos;
    }
    function highlight(item, word, charPosition) {
        resetCurrentItem();

        currentItem = item;
        var text = item.element.innerText.trim();

        var sentence = findCurrentSentence(item, charPosition);

        item.element.innerHTML =
            text.substring(0, sentence.start) +
            '<span class="talkify-sentence-highlight">' +
            text.substring(sentence.start, charPosition) +
            '<span class="talkify-word-highlight">' +
            text.substring(charPosition, charPosition + word.length) +
            '</span>' +
            text.substring(charPosition + word.length, sentence.end) +
            '</span>' +
            text.substring(sentence.end);

        renderEnhancedView(text, sentence, charPosition, word);
    }

    function cancel() {
        resetCurrentItem();

        currentPositions = [];
    }

    function setupWordHightlighting(item, positions, startFrom) {
        cancel();

        if (!positions.length) {
            return;
        }

        if (item.ssml || item.wordbreakms || currentWordbreakMs) {
            currentPositions = adjustPositionsToSsml(item.text, positions);
        } else {
            currentPositions = positions;
        }

        var i = startFrom || 0;

        var internalCallback = function () {
            currentItem = item;

            i++;

            if (i >= positions.length) {
                window.setTimeout(function () {
                    item.element.innerHTML = item.originalElement.innerHTML;

                    talkify.messageHub.publish(correlationId + ".wordhighlighter.complete", item);

                    if (enhancedView) {
                        document.body.removeChild(enhancedView);;
                        enhancedView = null;
                        initialEnhancedViewPosition = null;
                    }
                }, 1000);

                return;
            }
        };

        internalCallback();
    }

    function resetCurrentItem() {
        if (currentItem) {
            currentItem.element.innerHTML = currentItem.originalElement.innerHTML;
        }
    }

    function setPosition(message) {
        var diff = 0;
        var timeInMs = message.time * 1000;
        var nextPosition = 0;

        for (var i = 0; i < message.positions.length; i++) {
            var pos = message.positions[i];

            if (pos.Position < timeInMs) {
                continue;
            }

            diff = pos.Position - timeInMs;
            nextPosition = i;

            break;
        }

        var item = currentItem;
        var positions = message.positions;

        cancel();

        setTimeout(function () {
            setupWordHightlighting(item, positions, nextPosition);
        }, diff);
    }

    function findCurrentSentence(item, charPosition) {
        var text = item.element.innerText.trim();
        var separators = ['\.', '\?', '!', '。'];
        var baseline = text.split(new RegExp('[' + separators.join('') + ']', 'g'));
        var result = [];

        var currentSentence = "";

        if (baseline.length === 1) {
            result.push(baseline[0]);
        }

        for (var i = 0; i < baseline.length - 1; i++) {
            currentSentence += baseline[i] + ".";

            var isLast = i + 1 === baseline.length - 1;

            if (isLast || baseline[i + 1].startsWith(" ") || baseline[i + 1].startsWith("\n")) {
                result.push(currentSentence);
                currentSentence = "";
            }
        }

        var charactersTraversed = 0;
        var sentenceStart = 0;
        var sentenceEnd = text.length;

        for (var i = 0; i < result.length; i++) {
            if (charPosition >= charactersTraversed && charPosition <= charactersTraversed + result[i].length) {
                if (charactersTraversed > 0) {
                    sentenceStart = charactersTraversed + 1;
                }

                sentenceEnd = charactersTraversed + result[i].length;
                break;
            }

            charactersTraversed += result[i].length;
        }

        return {
            start: sentenceStart,
            end: sentenceEnd
        };
    }

    function dispose() {
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".player.tts.seeked");
        talkify.messageHub.unsubscribe("word-highlighter", [correlationId + ".player.tts.loading", correlationId + ".player.tts.disposed"]);
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".player.tts.play");
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".player.tts.timeupdated");
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".player.tts.enhancedvisibilityset");
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".controlcenter.attached");
        talkify.messageHub.unsubscribe("word-highlighter", correlationId + ".controlcenter.detatched");
    }

    function renderEnhancedView(text, sentence, charPosition, word) {
        if (!useEnhancedView) {
            return;
        }

        var html =
            '<p><span class="talkify-sentence-highlight">' +
            text.substring(sentence.start, charPosition) +
            '<span class="talkify-word-highlight">' +
            text.substring(charPosition, charPosition + word.length) +
            '</span>' +
            text.substring(charPosition + word.length, sentence.end) +
            '</span></p>';

        if (enhancedView) {
            enhancedView.innerHTML = html;

            return;
        }

        enhancedView = document.createElement("div");

        enhancedView.classList.add("talkify-enhanced-word-highligher");

        enhancedView.innerHTML = html;

        document.body.appendChild(enhancedView);

        adjustRenderPositionToControlCenter();
    }

    return {
        start: setupWordHightlighting,
        highlight: highlight,
        dispose: dispose
    };
};
},{}],21:[function(require,module,exports){
talkify = {};
},{}]},{},[1]);
