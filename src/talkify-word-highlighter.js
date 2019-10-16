talkify = talkify || {};
talkify.wordHighlighter = function (correlationId) {
    var currentItem = null;
    var currentPositions = [];
    var currentPosition = -1;
    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.seeked", setPosition);
    talkify.messageHub.subscribe("word-highlighter", [correlationId + ".player.tts.loading", correlationId + ".player.tts.disposed", correlationId + ".player.tts.ended"], cancel);
    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.play", function (message) {
        setupWordHightlighting(message.item, message.positions);
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

    function adjustPositionsToSsml(ssmlSections, ssml, positions, originalPositions, pos) {
        var internalPos = JSON.parse(JSON.stringify(positions));

        pos = pos || 0;

        if (pos >= ssmlSections.length) {
            return internalPos;
        }

        var internalSsml = ssml.replace("&", "&amp;");

        var lengthToCompensateFor = ssmlSections[pos].length + (internalSsml.length - ssml.length);
        var index = internalSsml.indexOf(ssmlSections[pos]);

        for (var i = 0; i < internalPos.length; i++) {
            if (originalPositions[i] < index) {
                continue;
            }

            internalPos[i].CharPosition -= lengthToCompensateFor;
        }

        internalPos = adjustPositionsToSsml(ssmlSections, internalSsml.substring(0, index) + "#" + internalSsml.substring(index + 1, internalSsml.length), internalPos, originalPositions, pos + 1);

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

        if (item.ssml) {
            var text = item.ssml;

            var result = text.match(/<[^>]*>/g) || [];

            currentPositions = adjustPositionsToSsml(result, text, positions, positions.map(function (x) { return x.CharPosition; }));
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
        var result = text.match(/[^\.!\?。]+[\.!\?。]+/g) || [];

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
    }

    return {
        start: setupWordHightlighting,
        highlight: highlight,
        dispose: dispose
    };
};