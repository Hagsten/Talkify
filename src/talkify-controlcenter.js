talkify = talkify || {};
talkify.playbar = function (parent, correlationId) {
    var settings = {
        parentElement: parent || talkify.config.ui.audioControls.container || document.body
    }

    var playElement, pauseElement, rateElement, volumeElement, progressElement, voiceElement, currentTimeElement, textHighlightingElement, wrapper;
    var attachElement, detatchedElement, dragArea, loader;

    function hide(element) {
        if (element.classList.contains("talkify-hidden")) {
            return;
        }

        element.className += " talkify-hidden";
    }

    function show(element) {
        element.className = element.className.replace("talkify-hidden", "");
    }

    function play() {
        hide(loader);
        hide(playElement);
        show(pauseElement);
    }

    function pause() {
        hide(loader);
        hide(pauseElement);
        show(playElement);
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

    function render() {
        var existingControl = document.getElementsByClassName("talkify-control-center")[0];
        if (existingControl) {
            existingControl.parentNode.removeChild(existingControl);
        }

        wrapper = createElement("div", "talkify-control-center attached");

        wrapper.innerHTML =
            ' <ul> ' +
            '<li class="drag-area"> ' +
            ' <i class="fa fa-grip-horizontal"></i> ' +
            ' </li> ' +
            ' <li> ' +
            ' <button class="talkify-play-button talkify-disabled" title="Play"> ' +
                ' <i class="fa fa-play"></i> ' +
            ' </button> ' +
            ' <button class="talkify-pause-button talkify-disabled" title="Pause"> ' +
                ' <i class="fa fa-pause"></i> ' +
            ' </button> ' +
            ' <i class="fa fa-circle-notch fa-spin audio-loading"></i>' +
            ' </li> ' +
            ' <li class="progress-wrapper"> ' +
            ' <progress value="0.0" max="1.0"></progress> ' +
            '<span class="talkify-time-element"> 00:00 / 00:00 </span>' +
            ' </li> ' +
            ' <li> ' +
            ' <button class="volume-button" title="Volume"> ' +
            ' <i class="fa fa-volume-up"></i> ' +
            ' <div class="volume-slider"> ' +
            ' <input type="range" value="10" min="0" max="10" title="Adjust playback volume"> ' +
            ' </div> ' +
            ' </button></li> ' +
            '<li> ' +
            '<button class="rate-button" title="Rate of speech"> ' +
            '<i class="fa fa-tachometer-alt"></i> ' +
            ' <div class="rate-slider"> ' +
            '<input type="range" value="10" min="0" max="10" title="Adjust playback rate"> ' +
            '</div> ' +
            ' </button> ' +
            ' </li> ' +
            ' <li> ' +
            ' <button class="talkify-cc-button" title="Enable/disable text highlighting"> ' +
            '<i class="fa fa-closed-captioning"></i> ' +
            '      </button> ' +
            ' </li> ' +
            // ' <li> ' +
            // ' <button title="Download"> ' +
            // '<i class="fa fa-download"></i> ' +
            // ' </button> ' +
            // ' </li> ' +
            ' <li> ' +
            ' <button class="talkify-detatched" title="Dock player to screen"> ' +
            ' <i class="fa fa-window-minimize"></i> ' +
            ' </button> ' +
            ' <button class="talkify-attached" title="Detach player"> ' +
            '<i class="fa fa-window-maximize"></i> ' +
            '</button> ' +
            '</ul> ' +
            ' <div class="talkify-voice-selector"> ' +
            // '<div class="talkify-voice-indicators"></div><div class="talkify-voice-indicators"></div><div class="talkify-voice-indicators"></div>' +
            ' Voice: <span></span>' +
            '</div>';

        playElement = wrapper.getElementsByClassName("talkify-play-button")[0];
        pauseElement = wrapper.getElementsByClassName("talkify-pause-button")[0];
        loader = wrapper.getElementsByClassName("audio-loading")[0];
        rateElement = wrapper.querySelector(".rate-button input[type=range]");
        volumeElement = wrapper.querySelector(".volume-button input[type=range]");
        progressElement = wrapper.getElementsByTagName("progress")[0];
        textHighlightingElement = wrapper.getElementsByClassName("talkify-cc-button")[0];
        currentTimeElement = wrapper.getElementsByClassName("talkify-time-element")[0];
        attachElement = wrapper.getElementsByClassName("talkify-detatched")[0];
        detatchedElement = wrapper.getElementsByClassName("talkify-attached")[0];
        voiceWrapperElement = wrapper.querySelector(".talkify-voice-selector select");
        dragArea = wrapper.getElementsByClassName("drag-area")[0];

        settings.parentElement.appendChild(wrapper);

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

        rateElement.addEventListener("change", function () {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.rate", parseInt(this.value));
        });

        volumeElement.addEventListener("change", function (e) {
            talkify.messageHub.publish(correlationId + ".controlcenter.request.volume", parseInt(this.value));
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
        });

        detatchedElement.addEventListener("click", function () {
            removeClass(controlCenter, "attached");
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
            controlCenter.style.top = e.clientY + "px";
            controlCenter.style.left = e.clientX + "px";
        }
    }

    function initialize() {
        render();
        setupBindings();

        talkify.messageHub.subscribe("controlcenter", [correlationId + ".player.*.pause", correlationId + ".player.*.disposed"], pause);
        talkify.messageHub.subscribe("controlcenter", [correlationId + ".player.*.play", correlationId + ".player.*.resume"], play);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.disposed", dispose);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.loading", function(){
            hide(playElement);
            hide(pauseElement);
            show(loader);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.loaded", function () {
            removeClass(pauseElement, "talkify-disabled");
            removeClass(playElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.texthighlight.enabled", function () {
            removeClass(textHighlightingElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.texthighlight.disabled", function () {
            addClass(textHighlightingElement, "talkify-disabled");
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.ratechanged", function (rate) {
            rateElement.value = rate;;
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.*.voiceset", function (voice) {
            featureToggle(voice);
            setVoiceName(voice);
        });

        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.tts.timeupdated", updateClock);
        talkify.messageHub.subscribe("controlcenter", correlationId + ".player.html5.timeupdated", function (value) {
            progressElement.setAttribute("value", value);
        });
    };

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

        if (isTalkifyHostedVoice(voice)) {
            return;
        }

        hide(currentTimeElement);

        if (!voice.localService) {
            hide(progressElement);
            hide(textHighlightingElement);
        }
    }

    function setVoiceName(voice) {
        var voiceElement = document.querySelector(".talkify-voice-selector > span");

        if (!voice) {
            voiceElement.textContent = "Automatic voice detection";
            return;
        }

        if (isTalkifyHostedVoice(voice)) {
            voiceElement.textContent = voice.description;
            return;
        }

        voiceElement.textContent = voice.name;
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
    }

    initialize();

    return {
        setMaxRate: function (value) {
            rateElement.setAttribute("max", value);
            return this;
        },
        setMinRate: function (value) {
            rateElement.setAttribute("min", value);
            return this;
        },
        dispose: dispose
    }
}