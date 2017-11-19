talkify = talkify || {};
talkify.wordHighlighter = function () {
    var textHighlightTimer = new talkify.timer();
    var currentItem = null;
    var currentPositions = [];

    function highlight(item, word, charPosition) {
        resetCurrentItem();

        currentItem = item;
        var text = item.element.innerText.trim();

        if (charPosition === 0) {
            item.element.innerHTML = '<span class="talkify-word-highlight">' + text.substring(0, word.length) + '</span> ' + text.substring(word.length + 1);

            return;
        }

        item.element.innerHTML = text.substring(0, charPosition) + '<span class="talkify-word-highlight">' + text.substring(charPosition, charPosition + word.length) + '</span>' + text.substring(charPosition - 1 + word.length + 1);
    }

    function cancel() {
        textHighlightTimer.cancel();

        resetCurrentItem();

        currentPositions = [];
    }

    function setupWordHightlighting(item, positions, startFrom) {
        var p = new promise.Promise();

        cancel();

        if (!positions.length) {
            return p.done(item);
        }

        currentPositions = positions;

        var i = startFrom || 0;

        var internalCallback = function () {
            highlight(item, positions[i].Word, positions[i].CharPosition);

            i++;

            if (i >= positions.length) {
                textHighlightTimer.cancel();

                window.setTimeout(function () {
                    item.element.innerHTML = item.originalElement.innerHTML;

                    p.done(item);
                }, 1000);

                return;
            }

            var next = (positions[i].Position - positions[i - 1].Position) + 0;

            textHighlightTimer.cancel();
            textHighlightTimer.start(internalCallback, next);
        };

        internalCallback();

        return p;
    }

    function resetCurrentItem() {
        if (currentItem) {
            currentItem.element.innerHTML = currentItem.originalElement.innerHTML;
        }
    }

    function setPosition(time) {
        var diff = 0;
        var timeInMs = time * 1000;
        var nextPosition = 0;

        for (var i = 0; i < currentPositions.length; i++) {
            var pos = currentPositions[i];

            if (pos.Position < timeInMs) {
                continue;
            }

            diff = pos.Position - timeInMs;
            nextPosition = i;

            break;
        }

        var item = currentItem;
        var positions = currentPositions;

        cancel();

        setTimeout(function () {
            setupWordHightlighting(item, positions, nextPosition);
        }, diff);
    }

    return {
        pause: textHighlightTimer.pause,
        resume: textHighlightTimer.resume,
        start: setupWordHightlighting,
        highlight: highlight,
        cancel: cancel,
        setPosition: setPosition
    };
};