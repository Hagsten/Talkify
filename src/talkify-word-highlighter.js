var TalkifyWordHighlighter = function() {
    var textHighlightTimer = new Timer();

    function highlight(item, word, charPosition) {
        var text = item.element.text().trim();

        if (charPosition === 0) {
            item.element.html('<span class="talkify-word-highlight">' + text.substring(0, word.length) + '</span> ' + text.substring(word.length + 1));

            return;
        }

        item.element.html(text.substring(0, charPosition) + '<span class="talkify-word-highlight">' + text.substring(charPosition, charPosition + word.length) + '</span>' + text.substring(charPosition - 1 + word.length + 1));
    }

    function setupWordHightlighting(item, positions) {
        var p = new promise.Promise();

        textHighlightTimer.cancel();

        if (!positions.length) {
            return p.done(item);
        }

        var i = 0;

        var internalCallback = function () {
            highlight(item, positions[i].Word, positions[i].CharPosition);

            i++;

            if (i >= positions.length) {
                window.setTimeout(function () {
                    item.element.html(item.originalElement.html());

                    p.done(item);
                }, 1000);

                return;
            }

            var next = positions[i].Position - positions[i - 1].Position;

            textHighlightTimer.cancel();
            textHighlightTimer.start(internalCallback, next);
        };

        internalCallback();

        return p;
    }
    
    return {
        pause: textHighlightTimer.pause,
        resume: textHighlightTimer.resume,
        start: setupWordHightlighting
    };
};