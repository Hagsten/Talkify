talkify = talkify || {};
talkify.textextractor = function () {
    var validElements = [];

    var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'].join();
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'br', 'style', 'code', 'nav', '#nav', '#navigation', '.nav', '.navigation', 'footer'].join();

    function getVisible(elements) {
        var result = [];

        for (var j = 0; j < elements.length; j++) {
            if (elements[j].is(':hidden')) {
                continue;
            }

            result.push(validElements[j]);
        }

        return result;
    }

    function getStrippedText(text) {
        return text.replace(/(\r\n|\n|\r)/gm, "").trim();
    }

    function isValidTextNode(node) {
        if (!node) {
            return false;
        }

        if (node.nodeName === "#text") {
            return getStrippedText(node.textContent).length >= 10;
        }

        return false;
    }

    function isValidAnchor($node) {
        if ($node.siblings().length >= 1) {
            return true;
        }

        var previous = $node[0].previousSibling;

        if (isValidTextNode(previous)) {
            return true;
        }

        var next = $node[0].nextSibling;

        if (isValidTextNode(next)) {
            return true;
        }

        return false;
    }

    function isValidForGrouping(node) {
        var isTextNode = node.nodeName === '#text';
        var textLength = getStrippedText(node.textContent).length;

        return (isTextNode && textLength >= 5) || $(node).is(inlineElements);
    }

    function getConnectedElements(nodes, firstIndex) {
        var connectedElements = [];

        for (var l = firstIndex; l < nodes.length; l++) {
            if (isValidForGrouping(nodes[l])) {
                connectedElements.push($(nodes[l]));
            } else {
                break;
            }
        }

        return connectedElements;
    }

    function group(elements) {
        //TODO: wrap in selectable element
        var wrapping = $('<span class="superbar"></span>');

        for (var j = 0; j < elements.length; j++) {
            wrapping.append(elements[j].clone());
        }

        return wrapping;
    }

    function wrapInSelectableElement(node) {
        return $('<span class="foobar"></span').append(node.textContent);
    }

    function wrapAndReplace(node) {
        var spanElement = wrapInSelectableElement(node);

        $(node).replaceWith(spanElement);

        return spanElement;
    }

    function evaluate(nodes) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        for (var i = 0; i < nodes.length; i++) {
            var $node = $(nodes[i]);

            if ($node.is('p, h1, h2, h3, h4, h5, h6')) {
                validElements.push($node);
                continue;
            }

            if ($node.is(forbiddenElementsString)) {
                var forcedElement = $node.find('h1, h2, h3, h4');

                forcedElement.each(function () {
                    validElements.push($(this));
                });

                continue;
            }

            if ($node.is('a') && !isValidAnchor($node)) {
                continue;
            }

            var connectedElements = getConnectedElements(nodes, i);

            if (connectedElements.length > 1) {
                var wrapping = group(connectedElements);
                var isAboveThreshold = getStrippedText(wrapping.text()).length >= 20;

                if (isAboveThreshold) {
                    $(nodes[i]).replaceWith(wrapping);

                    for (var j = 0; j < connectedElements.length; j++) {
                        connectedElements[j].remove();
                    }

                    validElements.push(wrapping);

                    continue;
                }
            }

            var node = nodes[i];

            if (isValidTextNode(node)) {
                validElements.push(wrapAndReplace(node));
            }

            evaluate(node.childNodes);
        }
    }

    function extract(rootSelector) {
        validElements = [];

        var topLevelElements = $(rootSelector + ' > *:not(' + forbiddenElementsString + ')');

        var date = new Date();

        for (var i = 0; i < topLevelElements.length; i++) {
            var $element = $(topLevelElements[i]);

            if ($element.is('p, h1, h2, h3, h4, h5, h6')) {
                validElements.push($element);

                continue;
            }

            evaluate(topLevelElements[i].childNodes);
        }

        var result = getVisible(validElements);

        console.log(new Date() - date);

        return result;
    }

    return {
        extract: extract
    };
};