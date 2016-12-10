var TalkifyWordHighlighter = function() {
    var textHighlightTimer = new Timer();
    var currentItem = null;

    function highlight(item, word, charPosition) {
        resetCurrentItem();

        currentItem = item;
        var text = item.element.text().trim();

        if (charPosition === 0) {
            item.element.html('<span class="talkify-word-highlight">' + text.substring(0, word.length) + '</span> ' + text.substring(word.length + 1));

            return;
        }

        item.element.html(text.substring(0, charPosition) + '<span class="talkify-word-highlight">' + text.substring(charPosition, charPosition + word.length) + '</span>' + text.substring(charPosition - 1 + word.length + 1));
    }

    function cancel() {
        textHighlightTimer.cancel();

        resetCurrentItem();
    }

    function setupWordHightlighting(item, positions) {
        var p = new promise.Promise();

        cancel();

        if (!positions.length) {
            return p.done(item);
        }

        var i = 0;

        var internalCallback = function () {
            highlight(item, positions[i].Word, positions[i].CharPosition);

            i++;

            if (i >= positions.length) {
                textHighlightTimer.cancel();

                window.setTimeout(function () {
                    item.element.html(item.originalElement.html());

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
            currentItem.element.html(currentItem.originalElement.html());
        }
    }
    
    return {
        pause: textHighlightTimer.pause,
        resume: textHighlightTimer.resume,
        start: setupWordHightlighting,
        highlight: highlight,
        cancel: cancel
    };
};