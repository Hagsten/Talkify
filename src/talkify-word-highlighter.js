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

        //Same as in playlist. Utilmetod?
        item.element.innerHTML = item.element.innerHTML.replace(/ +/g, " ").replace(/(\r\n|\n|\r)/gm, "").trim();

        highlightCurrentSentence(item.element, charPosition);
        highlightCurrentWord(word, charPosition, 0, item.element.childNodes);
    }

    function highlightCurrentSentence(element, charPosition, currentPosition) {
        var index = 0;

        var sentence = findSentence(element.childNodes, 0);

        index += sentence.text.length;

        if (charPosition <= index) {
            wrapSentence(sentence);

            return;
        }

        while (sentence.next.length) {
            sentence = findSentence(sentence.next, charPosition)

            index += sentence.text.length;

            if (charPosition <= index) {
                wrapSentence(sentence);

                return;
            }
        }
    }

    function wrapSentence(sentence) {
        var wrapper = document.createElement('span');
        wrapper.className = "talkify-sentence-highlight";

        sentence.nodes[0].parentElement.insertBefore(wrapper, sentence.nodes[0]);

        for (var i = 0; i < sentence.nodes.length; i++) {
            wrapper.appendChild(sentence.nodes[i]);
        }

    }

    function findSentence(nodes, textIndex) {
        var nodesInSentence = [];
        var nodesRemaining = [];
        var textIndex = textIndex || 0;
        var text = "";
        var index = 0;

        for (var i = 0; i < nodes.length; i++) {
            index = i;
            var node = nodes[i];

            nodesInSentence.push(node);

            if (node.nodeType === 3) { //textcontent
                var indexOfSentenceEnd =
                    ((node.textContent.indexOf(".") + 1) ||
                        (node.textContent.indexOf("?") + 1) ||
                        (node.textContent.indexOf("!") + 1)) - 1;

                if (indexOfSentenceEnd > -1) {
                    var rightHandSide = node.splitText(indexOfSentenceEnd + 1);

                    nodesRemaining.push(rightHandSide);

                    text += node.textContent;

                    break;

                } else {
                    text += node.textContent;

                    textIndex += node.textContent.length;
                }

            } else {
                var response = findSentence(node.childNodes, textIndex);

                textIndex += response.textIndex;
                text += response.text;
            }
        }

        for (var i = index + 1; i < nodes.length; i++) {
            if (nodesRemaining.indexOf(nodes[i]) > -1) {
                continue;
            }

            nodesRemaining.push(nodes[i]);
        }

        return {
            nodes: nodesInSentence,
            next: nodesRemaining,
            text: text,
            textIndex: textIndex
        };
    }

    function highlightCurrentWord(word, charPosition, textIndex, nodes, previousCharWasWhitespace) {
        var lastCharIsWhitespace = false;

        for (var i = 0; i < nodes.length; i++) {
            var childNode = nodes[i];

            var isTextNode = childNode.nodeType === 3;

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
                var response = highlightCurrentWord(word, charPosition, textIndex, childNode.childNodes, lastCharIsWhitespace || previousCharWasWhitespace);

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