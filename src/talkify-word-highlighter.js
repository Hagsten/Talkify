talkify = talkify || {};
talkify.wordHighlighter = function (correlationId) {
  var currentItem = null;
  var currentPositions = [];
  var currentPosition = -1;
  var currentWordbreakMs = 0;
  var useEnhancedView = false;
  var enhancedView = null;
  var currentControlcenterPosition = null;

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".player.tts.seeked",
    setPosition
  );
  talkify.messageHub.subscribe(
    "word-highlighter",
    [
      correlationId + ".player.tts.loading",
      correlationId + ".player.tts.disposed",
      correlationId + ".player.tts.ended",
    ],
    function () {
      cancel();

      if (enhancedView) {
        document.body.removeChild(enhancedView);
        enhancedView = null;
      }
    }
  );

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".player.tts.play",
    function (message) {
      setupWordHightlighting(message.item, message.positions);
    }
  );

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".player.tts.wordbreakchanged",
    function (wordbreakms) {
      currentWordbreakMs = wordbreakms;
    }
  );

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".player.tts.timeupdated",
    function (timeInfo) {
      if (!currentPositions.length) {
        return;
      }

      var time = timeInfo.currentTime * 1000;

      var currentPos = 0;

      if (time < currentPositions[0].Position) {
        if (currentPosition === -1) {
          return;
        }

        currentPosition = 0;
        highlight(
          currentItem,
          currentPositions[0].Word,
          currentPositions[0].CharPosition
        );
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

      highlight(
        currentItem,
        currentPositions[currentPos].Word,
        currentPositions[currentPos].CharPosition
      );
    }
  );

  function adjustPositionsForPrefix(item) {
    if (!item.prefix) {
      return;
    }

    var itemPrefix = item.prefix.replace(/\s/g, "").replace(/[.,?!。，]/g, "");
    var prefix = "";

    var lastPrefixIndex = 0;
    var prefixEndsAtPosition = 0;

    for (var i = 0; i < currentPositions.length; i++) {
      prefix += currentPositions[i].Word;

      if (prefix === itemPrefix) {
        lastPrefixIndex = i;
        prefixEndsAtPosition =
          currentPositions[i].CharPosition +
          currentPositions[i].Word.length +
          2; //": "
        break;
      }
    }

    currentPositions.splice(0, lastPrefixIndex + 1);

    for (var i = 0; i < currentPositions.length; i++) {
      currentPositions[i].CharPosition -= prefixEndsAtPosition;
    }
  }

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".player.tts.enhancedvisibilityset",
    function (value) {
      useEnhancedView = value;

      if (!value && enhancedView) {
        document.body.removeChild(enhancedView);
        enhancedView = null;
      }
    }
  );

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".controlcenter.attached",
    function (position) {
      currentControlcenterPosition = position;

      adjustRenderPositionToControlCenter();
    }
  );

  talkify.messageHub.subscribe(
    "word-highlighter",
    correlationId + ".controlcenter.detatched",
    function (position) {
      currentControlcenterPosition = position;

      adjustRenderPositionToControlCenter();
    }
  );

  function adjustRenderPositionToControlCenter() {
    if (enhancedView && currentControlcenterPosition) {
      var enhancedViewPosition = enhancedView.getBoundingClientRect();

      var hasOverlay =
        enhancedViewPosition.y >= currentControlcenterPosition.y &&
        enhancedViewPosition.y <=
          currentControlcenterPosition.y + currentControlcenterPosition.height;

      hasOverlay =
        hasOverlay ||
        (currentControlcenterPosition.y >= enhancedViewPosition.y &&
          currentControlcenterPosition.y <=
            enhancedViewPosition.y + enhancedViewPosition.height);

      if (hasOverlay) {
        enhancedView.style.bottom = currentControlcenterPosition.height + "px";
      } else {
        enhancedView.style.bottom = "";
      }
    }
  }

  function adjustPositionsToSsml(text, positions) {
    var internalPos = JSON.parse(JSON.stringify(positions));

    var lastFound = 0;

    for (var i = 0; i < internalPos.length; i++) {
      lastFound = text.indexOf(internalPos[i].Word, lastFound);
      internalPos[i].CharPosition = lastFound;
    }

    return internalPos;
  }

  function highlight(item, word, charPosition) {
    if (item.element.nodeName === "IMG") {
      return;
    }

    resetCurrentItem();

    currentItem = item;    

    trimWhitespaceTextNodes([item.element]);

    var sentence = findCurrentSentence(item, charPosition);
    var mappings = findTextAndElementPairs(item.element);

    highlightSentence(sentence, findElementsWitinSentence(sentence, mappings));
    highlightWord(findTextAndElementPairs(item.element), word, charPosition);

    renderEnhancedView(item.element.innerText.trim(), sentence, charPosition, word);
  }

  function highlightSentence(sentence, elementsInSentence){
    var traversedCharacters = 0;
    var elementsInSentenceIndex = 0;

    for (var i = 0; i < elementsInSentence.length; i++) {
      var mapping = elementsInSentence[i];

      if (!mapping.element || mapping.element.nodeName === "IMG") {
        traversedCharacters += mapping.text.length;
        continue;
      }

      var localStartPosition = elementsInSentenceIndex === 0 ? sentence.start - traversedCharacters : 0;
      var localEndPosition = Math.min(sentence.end - traversedCharacters ,mapping.text.length);

      traversedCharacters += mapping.text.length;

      let part1 = mapping.text.slice(0, localStartPosition);
      let part2 = mapping.text.slice(localStartPosition, localEndPosition);
      let part3 = mapping.text.slice(localEndPosition)

      let newHtml =
        part1 +
        '<span class="talkify-sentence-highlight">' +
        part2 +
        "</span>" +
        part3;

      replaceHtmlOn(mapping.element, newHtml);

      elementsInSentenceIndex++;
    }
  }

  function highlightWord(mappings, word, charPosition){
    var traversedCharacters = 0;

    for (var i = 0; i < mappings.length; i++) {
      var mapping = mappings[i];

      if (charPosition >= traversedCharacters + mapping.text.length) {
        traversedCharacters += mapping.text.length;
        continue;
      }

      var localPosition = charPosition - traversedCharacters;

      let part1 = mapping.text.slice(0, localPosition);
      let part2 = mapping.text.slice(localPosition + word.length);

      let newHtml =
        part1 +
        '<span class="talkify-word-highlight">' +
        word +
        "</span>" +
        part2;

      replaceHtmlOn(mapping.element, newHtml);
      break;
    }
  }

  function replaceHtmlOn(element, newHtml){
    if (element.nodeType === Node.TEXT_NODE) {
        var replacementNode = document.createElement("span");
        replacementNode.innerHTML = newHtml;
        element.parentNode.insertBefore(
          replacementNode,
          element
        );
        element.parentNode.removeChild(element);
      } else {
        element.innerHTML = newHtml;
      }
  }

  function findElementsWitinSentence(sentence, mappings){
    var elementsInSentence = [];
    var traversedCharacters = 0;

    for (var i = 0; i < mappings.length; i++) {
      var mapping = mappings[i];

      //start is within this element mapping
      if (sentence.start >= traversedCharacters && sentence.start < traversedCharacters + mapping.text.length) {
        elementsInSentence.push({
          element: mapping.element,
          text: mapping.text,
        });

        traversedCharacters += mapping.text.length;
        continue;
      }

      //end is within this element mapping
      if (
        traversedCharacters >= sentence.start &&
        sentence.end > traversedCharacters
      ) {
        elementsInSentence.push({
          element: mapping.element,
          text: mapping.text,
        });
        traversedCharacters += mapping.text.length;
        continue;
      }

      elementsInSentence.push({text: mapping.text});

      traversedCharacters += mapping.text.length;
    }

    return elementsInSentence;
  }

  function trimWhitespaceTextNodes(elements){
    for(var i = 0; i < elements.length; i++){
        var element = elements[i];

        if(element.nodeType === Node.TEXT_NODE){
            element.textContent = element.textContent.replace(/\n\s+/g, ' ').replace(/\n+/g, ' ');
            continue;
        }

        trimWhitespaceTextNodes(element.childNodes);
    }
  }

  function findTextAndElementPairs(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    var result = mapTextToElement(element.childNodes, walker);

    for(var i = 0; i < result.length; i++){
        var mapping = result[i];
        var previous = i > 0 ? result[i - 1] : { text: ''  };

        if((!previous.canTrimEnd || previous.text.length === 0) && mapping.canTrimStart){
            mapping.text = mapping.text.trimStart();
        }

        if(mapping.canTrimEnd){
            mapping.text = mapping.text.trimEnd();
        }

        mapping.text = mapping.text.replace(/\n\s+/g, ' ');
    }

    return result;
  }

  function mapTextToElement(nodes, walker) {
    if (nodes.length === 0) {
      return [];
    }

    var mappings = [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        var nodeText = node.textContent;

        if (nodeText !== " " && !nodeText.trim()) {
          continue;
        }

        var text = node.textContent;

        walker.currentNode = node;

        const nextNode = walker.nextNode();

        walker.currentNode = node;

        const previousNode = walker.previousNode();

        var previousHasTrailing = nodeContainsTrailingSpace(previousNode);
        var nextHasLeading = nodeContainsLeadingSpace(nextNode);

        var canTrimStart = previousHasTrailing || previousNode === null;
        var canTrimEnd = nextHasLeading || nextNode === null;

        mappings.push({
          text: text,
          element: node,
          canTrimStart: canTrimStart,
          canTrimEnd: canTrimEnd
        });
      } else if (node.nodeName === "IMG") {
        var imgAltText = node.getAttribute("alt").trim();

        if (!imgAltText) {
          continue;
        }

        mappings.push({
          text: " " + imgAltText + " ",
          element: node,
        });
      } else {
        mappings.push(mapTextToElement(node.childNodes, walker));
      }
    }

    return mappings.flat(Infinity);
  }

  function nodeContainsLeadingSpace(node) {
    if (!node) {
      return false;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return (
        node.textContent.replace(/\n\s+/g, ' ').trimStart().length === node.textContent.replace(/\n\s+/g, ' ').length - 1
      );
    }

    return node.innerText.trimStart().length === node.innerText.length - 1;
  }

  function nodeContainsTrailingSpace(node) {
    if (!node) {
      return false;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\n\s+/g, ' ').trimEnd().length === node.textContent.replace(/\n\s+/g, ' ').length - 1;
    }

    return node.innerText.trimEnd().length === node.innerText.length - 1;
  }

  function cancel() {
    resetCurrentItem();

    currentPositions = [];
    currentPosition = -1;
  }

  function setupWordHightlighting(item, positions, startFrom) {
    cancel();

    if (!positions.length) {
      return;
    }

    if (item.ssml || item.wordbreakms || currentWordbreakMs) {
      currentPositions = adjustPositionsToSsml(item.text, positions);
    } else {
      currentPositions = positions;
    }

    adjustPositionsForPrefix(item);

    var i = startFrom || 0;

    var internalCallback = function () {
      currentItem = item;

      i++;

      if (i >= positions.length) {
        window.setTimeout(function () {
          item.element.innerHTML = item.originalElement.innerHTML;

          talkify.messageHub.publish(
            correlationId + ".wordhighlighter.complete",
            item
          );

          if (enhancedView) {
            document.body.removeChild(enhancedView);
            enhancedView = null;
            initialEnhancedViewPosition = null;
          }
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
    var text = item.text.replace(/\n\s+/g, ' ').trim();
    var separators = [".", "?", "!", "。"];
    var baseline = text.split(
      new RegExp("[" + separators.join("") + "](?!\\S)", "g")
    );
    var result = [];

    var currentSentence = "";

    for (var i = 0; i < baseline.length; i++) {
      currentSentence += baseline[i] + ".";

      var isLast = i + 1 === baseline.length;

      if (
        isLast ||
        baseline[i + 1].startsWith(" ") ||
        baseline[i + 1].startsWith("\n")
      ) {
        result.push(currentSentence);
        currentSentence = "";
      }
    }

    var charactersTraversed = 0;
    var sentenceStart = 0;
    var sentenceEnd = text.length;

    for (var i = 0; i < result.length; i++) {
      if (
        charPosition >= charactersTraversed &&
        charPosition <= charactersTraversed + result[i].length
      ) {
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
      end: sentenceEnd,
    };
  }

  function dispose() {
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".player.tts.seeked"
    );
    talkify.messageHub.unsubscribe("word-highlighter", [
      correlationId + ".player.tts.loading",
      correlationId + ".player.tts.disposed",
    ]);
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".player.tts.play"
    );
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".player.tts.timeupdated"
    );
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".player.tts.enhancedvisibilityset"
    );
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".controlcenter.attached"
    );
    talkify.messageHub.unsubscribe(
      "word-highlighter",
      correlationId + ".controlcenter.detatched"
    );
  }

  function renderEnhancedView(text, sentence, charPosition, word) {
    if (!useEnhancedView) {
      return;
    }

    var html =
      '<p><span class="talkify-sentence-highlight">' +
      text.substring(sentence.start, charPosition) +
      '<span class="talkify-word-highlight">' +
      text.substring(charPosition, charPosition + word.length) +
      "</span>" +
      text.substring(charPosition + word.length, sentence.end) +
      "</span></p>";

    if (enhancedView) {
      enhancedView.innerHTML = html;

      return;
    }

    enhancedView = document.createElement("div");

    enhancedView.classList.add("talkify-enhanced-word-highligher");

    enhancedView.innerHTML = html;

    document.body.appendChild(enhancedView);

    adjustRenderPositionToControlCenter();
  }

  return {
    start: setupWordHightlighting,
    highlight: highlight,
    dispose: dispose,
  };
};
