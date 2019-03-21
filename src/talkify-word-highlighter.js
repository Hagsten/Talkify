talkify = talkify || {};
talkify.wordHighlighter = function () {
    var currentItem = null;
    var currentPositions = [];

    talkify.messageHub.subscribe("word-highlighter", "player.tts.seeked", setPosition);
    talkify.messageHub.subscribe("word-highlighter", ["player.tts.loading", "player.tts.disposed"], cancel);
    talkify.messageHub.subscribe("word-highlighter", "player.tts.play", function (message) {
        setupWordHightlighting(message.item, message.positions);
    });

    talkify.messageHub.subscribe("word-highlighter", "player.tts.timeupdated", function (timeInfo) {
        // console.log(time);

        if(!currentPositions.length){
            return;
        }

        var time = timeInfo.currentTime * 1000;

        var currentPos = 0;
        for (var i = 0; i < currentPositions.length; i++) {
            if(i === currentPositions.length - 1){
                currentPos = i;
                break;
            }

            var position = currentPositions[i].Position;

            if(time >= position && time <= currentPositions[i + 1].Position){
                currentPos = i;
                break;
            }
        }

        //TODO: Här. Verkar funka. Försök bygga bort timern.
        console.log("Would highlight " + currentPositions[currentPos].Word);
        highlight(currentItem, currentPositions[currentPos].Word, currentPositions[currentPos].CharPosition);
    });

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

        currentPositions = positions;

        var i = startFrom || 0;

        var internalCallback = function () {
            highlight(item, positions[i].Word, positions[i].CharPosition);

            i++;

            if (i >= positions.length) {
                window.setTimeout(function () {
                    item.element.innerHTML = item.originalElement.innerHTML;

                    talkify.messageHub.publish("wordhighlighter.complete", item);
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

    function findCurrentSentence(item, charPosition) {
        var text = item.element.innerText.trim();
        var result = text.match(/[^\.!\?]+[\.!\?]+/g) || [];

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

    return {
        start: setupWordHightlighting,
        highlight: highlight,
    };
};