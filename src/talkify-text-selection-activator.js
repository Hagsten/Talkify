talkify = talkify || {};

talkify.selectionActivator = function () {
    var timeoutId, player;

    function getSelectionText() {
        return window.getSelection().toString();
    }

    function show(text) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(hide, 3000);

        if (!player) {
            player = new talkify.TtsPlayer();
            player.forceVoice({ name: 'Zira', description: "Zira" });
            player.useControlCenter("local");
        }

        player.playText(text);
    }

    function hide() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }

    function activate() {
        document.onmouseup = document.onkeyup = function () {
            var text = getSelectionText();

            if (text) {
                show(text);
            } else {
                hide();
            }
        };
    }

    return {
        activate: activate
    }
}();