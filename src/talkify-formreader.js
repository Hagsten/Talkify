talkify = talkify || {};

talkify.formReader = function () {
    var player;
        
    function setupForm(formElement) {
        var elements = formElement.elements;

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener("focus", onFocus);
        }
    }

    function onFocus(e) {
        if (!player) {
            player = talkify.config.formReader.remoteService ? new talkify.TtsPlayer() : new talkify.Html5Player();
        }

        var config = talkify.config.formReader;

        if (config.voice) {
            player.forceVoice({ name: config.voice });
        }

        player.setRate(config.rate);

        if (this.type === "button" || this.type === "submit") {
            player.playText(this.value || this.innerText);
            return;
        }

        var requiredText = this.attributes.required ? config.requiredText : "";

        var label = findLabelFor(this);

        if (label) {
            var text = "";

            if (this.value) {
                text = config.valueText.replace("{value}", this.value);
            }

            player.playText(text + label.innerText + ". " + requiredText);
        } else {
            player.playText(this.value + ". " + requiredText);
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
        }
    };
}();