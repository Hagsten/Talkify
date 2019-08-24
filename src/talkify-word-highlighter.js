talkify = talkify || {};
talkify.wordHighlighter = function (correlationId) {
    var currentItem = null;
    var currentPositions = [];
    var currentPosition = -1;

    talkify.messageHub.subscribe("word-highlighter", correlationId + ".player.tts.seeked", setPosition);
    talkify.messageHub.subscribe("word-highlighter", [correlationId + ".player.tts.loading", correlationId + ".player.tts.disposed"], cancel);
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

    function adjustPositionsToSsml(result, ssml, positions, originalPositions, pos) {
        var internalPos = JSON.parse(JSON.stringify(positions));

        pos = pos || 0;

        if (pos >= result.length) {
            return internalPos;
        }

        var lengthToCompensateFor = result[pos].length;
        var index = ssml.indexOf(result[pos]);

        for (var i = 0; i < internalPos.length; i++) {
            if (originalPositions[i] < index) {
                continue;
            }

            internalPos[i].CharPosition -= lengthToCompensateFor;
        }

        internalPos = adjustPositionsToSsml(result, ssml.substring(0, index) + "#" + ssml.substring(index + 1, ssml.length), internalPos, originalPositions, pos + 1);

        return internalPos;
    }

    function highlight(item, word, charPosition) {
        resetCurrentItem();

        currentItem = item;

        var text = item.element.innerText.trim();

        var sentence = findCurrentSentence(item, charPosition);

        //Samma som i playlist. Utilmetod om denna behålls?
        item.element.innerHTML = item.element.innerHTML.replace(/ +/g, " ").replace(/(\r\n|\n|\r)/gm, "").trim();
        // console.log(word);
        newHighlight(word, charPosition, 0, item.element.childNodes);




        // item.element.innerHTML =
        //     text.substring(0, sentence.start) +
        //     '<span class="talkify-sentence-highlight">' +
        //     text.substring(sentence.start, charPosition) +
        //     '<span class="talkify-word-highlight">' +
        //     text.substring(charPosition, charPosition + word.length) +
        //     '</span>' +
        //     text.substring(charPosition + word.length, sentence.end) +
        //     '</span>' +
        //     text.substring(sentence.end);
    }

    function newHighlight(word, charPosition, textIndex, nodes, previousCharWasWhitespace) {
        var lastCharIsWhitespace = false;

        for (var i = 0; i < nodes.length; i++) {
            var childNode = nodes[i];

            var isTextNode = childNode.nodeType === 3; //&& childNode.textContent.trim() !== '';

            if (isTextNode) {
                if (previousCharWasWhitespace && childNode.textContent.trim() === "") {
                    continue;
                }

                var leadingWhiteSpaces = previousCharWasWhitespace ? 0 : childNode.textContent.length - childNode.textContent.trimStart().length;

                if (textIndex > 0) {
                    textIndex += leadingWhiteSpaces;
                }

                lastCharIsWhitespace = childNode.textContent.trimEnd() !== childNode.textContent;

                var isInsideTextNode = childNode.textContent.indexOf(word) > -1 &&
                    charPosition >= textIndex &&
                    charPosition < textIndex + childNode.textContent.trimStart().length;

                if (isInsideTextNode) {
                    var splitOffset = charPosition - textIndex;
                    var rigthHandSide = childNode.splitText(splitOffset);

                    var wrapper = document.createElement('span');
                    wrapper.className = "talkify-word-highlight";

                    if (rigthHandSide.textContent.length > word.length) {
                        var firstOccurranceOfWord = rigthHandSide.textContent.indexOf(word);

                        if (firstOccurranceOfWord === 0) {
                            rigthHandSide.splitText(word.length);
                        } else {
                            rigthHandSide = rigthHandSide.splitText(firstOccurranceOfWord);

                            rigthHandSide.splitText(word.length);
                        }
                    }

                    rigthHandSide.parentElement.insertBefore(wrapper, rigthHandSide);
                    wrapper.appendChild(rigthHandSide);

                    return {
                        found: true,
                        textIndex: textIndex
                    };
                }

                textIndex += childNode.textContent.length - leadingWhiteSpaces;
            } else {
                var response = newHighlight(word, charPosition, textIndex, childNode.childNodes, lastCharIsWhitespace || previousCharWasWhitespace);

                if (response.found) {
                    return response;
                }

                textIndex = response.textIndex;
            }
        }

        return {
            found: false,
            textIndex: textIndex
        };
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