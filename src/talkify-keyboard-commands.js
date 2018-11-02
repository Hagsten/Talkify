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