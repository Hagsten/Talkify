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