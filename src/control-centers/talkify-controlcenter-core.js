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
    var flagElement, phonationNormalElement, phonationSoftElement, phonationWhisperElement, phonationDropDown, downloadElement, downloadLoadingElement, downloadErrorElement;
    var voices = [];

    var noopElement = document.createElement("div");
    playElement = pitchElementWrapper = nextItemElement = enhancedVisibilityElement = voiceNameElement = previousItemElement = phonationNormalElement = phonationSoftElement = phonationWhisperElement = phonationDropDown = flagElement = wordBreakElement = wordBreakElementWrapper = pitchElement = dragArea = textInteractionElement = voiceWrapperElement = attachElement = currentTimeElement = detatchedElement = pauseElement = loader = erroroccurredElement = progressElement = textHighlightingElement = noopElement;
    rateElement = volumeElement = [];

    function hide(element) {
        if (!element) {
            return;
        }

        var arr = Array.isArray(element) ?
            element :
            NodeList.prototype.isPrototypeOf(element) ?
                Array.from(element) :
                [element];

        arr.forEach(function (x) {
            if (x.classList.contains("talkify-hidden")) {
                return;
            }

            x.className += " talkify-hidden";
        });
    }

    function show(element) {
        if (!element) {
            return;
        }

        var arr = Array.isArray(element) ?
            element :
            NodeList.prototype.isPrototypeOf(element) ?
                Array.from(element) :
                [element];

        arr.forEach(function (x) {
            x.className = x.className.replace("talkify-hidden", "");
        });
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
        var arr = Array.isArray(element) ?
            element :
            NodeList.prototype.isPrototypeOf(element) ?
                Array.from(element) :
                [element];

        arr.forEach(function (x) {
            if (x.classList.contains(c)) {
                return;
            }

            x.className += (" " + c);
        });
    }

    function removeClass(element, c) {
        var arr = Array.isArray(element) ?
            element :
            NodeList.prototype.isPrototypeOf(element) ?
                Array.from(element) :
                [element];

        arr.forEach(function (x) {
            x.className = x.className.replace(c, "");
        });
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
        downloadElement = document.querySelectorAll('.talkify-download-button') || [];
        downloadLoadingElement = document.querySelectorAll('.talkify-download-loading') || [];
        downloadErrorElement = document.querySelectorAll('.talkify-download-error') || [];

        settings.parentElement.appendChild(wrapper);

        talkify.messageHub.publish(correlationId + ".controlcenter.attached", wrapper.getBoundingClientRect());

        hide(loader);
        hide(downloadLoadingElement);
        hide(downloadErrorElement);
        addClass(downloadElement, "talkify-disabled");

        if (!talkify.config.ui.audioControls.downloadEnabled) {
            hide(downloadElement);

            downloadElement = downloadErrorElement = downloadLoadingElement = noopElement;
        }

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

        if (talkify.config.ui.audioControls.downloadEnabled) {
            downloadElement.forEach(function (x) {
                x.addEventListener("click", function () {
                    talkify.messageHub.publish(correlationId + ".controlcenter.request.download");
                });
            });
        }

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
            removeClass(downloadElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.textinteraction.enabled", function () {
            removeClass(textInteractionElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".playlist.textinteraction.disabled", function () {
            addClass(textInteractionElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.download.started", function () {
            hide(downloadElement);
            show(downloadLoadingElement);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.download.completed", function () {
            show(downloadElement);
            hide(downloadLoadingElement);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.download.error", function (obj) {
            hide(downloadLoadingElement);
            show(downloadErrorElement);

            downloadErrorElement.title = obj.statusText;
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
            .then(function (data) {
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
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.download.error");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.download.started");
        talkify.messageHub.unsubscribe("controlcenter", correlationId + ".player.tts.download.completed");
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