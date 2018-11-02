talkify = talkify || {};
talkify.textextractor = function () {
    var validElements = [];

    var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'];
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'br', 'style', 'code', 'nav', '#nav', '#navigation', '.nav', '.navigation', 'footer', 'rp', 'rt'];
    var userExcludedElements = [];

    function getVisible(elements) {
        var result = [];

        for (var j = 0; j < elements.length; j++) {
            if (!isVisible(elements[j])) {
                continue;
            }

            result.push(validElements[j]);
        }

        return result;
    }

    function isVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    function getStrippedText(text) {
        return text.replace(/(\r\n|\n|\r)/gm, "").trim();
    }

    function isValidTextNode(node) {
        if (!node) {
            return false;
        }

        if (node.nodeType === 3) {
            return getStrippedText(node.textContent).length >= 10;
        }

        return false;
    }

    function isValidAnchor(node) {
        var nrOfSiblings = getSiblings(node);

        if (nrOfSiblings.length >= 1) {
            return true;
        }

        var previous = node.previousSibling;

        if (isValidTextNode(previous)) {
            return true;
        }

        if (isValidTextNode(node.nextSibling)) {
            return true;
        }

        return false;
    }

    function isValidForGrouping(node) {
        var isTextNode = node.nodeType === 3;
        var textLength = getStrippedText(node.textContent).length;

        return (isTextNode && textLength >= 5) || (!isForbidden(node) && elementIsInlineElement(node));
    }

    function getConnectedElements(nodes, firstIndex) {
        var connectedElements = [];

        for (var l = firstIndex; l < nodes.length; l++) {
            if (isValidForGrouping(nodes[l])) {
                connectedElements.push(nodes[l]);
            } else {
                break;
            }
        }

        return connectedElements;
    }

    function group(elements) {
        //TODO: wrap in selectable element
        wrapping = document.createElement('span');
        wrapping.classList.add("superbar");

        for (var j = 0; j < elements.length; j++) {
            wrapping.appendChild(elements[j].cloneNode(true));
        }

        return wrapping;
    }

    function wrapInSelectableElement(node) {
        wrapping = document.createElement('span');
        wrapping.classList.add("foobar");
        wrapping.innerText = node.textContent;
        return wrapping;
    }

    function wrapAndReplace(node) {
        var spanElement = wrapInSelectableElement(node);

        if (node.parentNode) {
            node.parentNode.replaceChild(spanElement, node);
        }

        return spanElement;
    }

    function evaluate(nodes) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if (elementIsParagraphOrHeader(node)) {
                validElements.push(node);
                continue;
            }

            if (getForbiddenElements().indexOf(getSafeTagName(node).toLowerCase()) !== -1) {
                var forcedElement = (node.nodeType === 1 ? node : node.parentNode).querySelectorAll('h1, h2, h3, h4');

                for (var k = 0; k < forcedElement.length; k++) {
                    validElements.push(forcedElement[k]);
                }

                continue;
            }

            if (getSafeTagName(node).toLowerCase() === 'a' && !isValidAnchor(node)) {
                continue;
            }

            var connectedElements = getConnectedElements(nodes, i);

            if (connectedElements.length > 1) {
                var wrapping = group(connectedElements);
                var isAboveThreshold = getStrippedText(wrapping.innerText).length >= 20;

                if (isAboveThreshold) {
                    nodes[i].parentNode.replaceChild(wrapping, nodes[i]);

                    for (var j = 0; j < connectedElements.length; j++) {
                        var parentNode = connectedElements[j].parentNode;

                        if (!parentNode) {
                            continue;
                        }

                        connectedElements[j].parentNode.removeChild(connectedElements[j]);
                    }

                    validElements.push(wrapping);

                    continue;
                }
            }

            if (isValidTextNode(node)) {
                validElements.push(wrapAndReplace(node));
            }

            evaluate(node.childNodes);
        }
    }

    function extract(rootSelector, exclusions) {
        userExcludedElements = exclusions || [];
        validElements = [];

        var topLevelElements = document.querySelectorAll(rootSelector + ' > ' + generateExcludesFromForbiddenElements());

        var date = new Date();

        for (var i = 0; i < topLevelElements.length; i++) {
            var element = topLevelElements[i];

            if (elementIsParagraphOrHeader(element)) {
                validElements.push(element);

                continue;
            }

            evaluate(topLevelElements[i].childNodes);
        }

        var result = getVisible(validElements);

        return result;
    }

    function generateExcludesFromForbiddenElements() {
        var result = '*';

        var forbiddenElements = getForbiddenElements();

        for (var i = 0; i < forbiddenElements.length; i++) {
            result += ':not(' + forbiddenElements[i] + ')';
        }

        return result;
    }

    function elementIsParagraphOrHeader(element) {
        if (element.nodeType === 3) {
            return false;
        }

        return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(getSafeTagName(element).toLowerCase()) != -1;
    }

    function elementIsInlineElement(element) {
        if (element.nodeType === 3) {
            return false;
        }

        return inlineElements.indexOf(getSafeTagName(element).toLowerCase()) != -1;
    }

    function getSafeTagName(node) {
        return node.tagName || '';
    }

    function getChildren(n, skipMe) {
        var r = [];
        for (; n; n = n.nextSibling)
            if (n.nodeType == 1 && n != skipMe && !isForbidden(n))
                r.push(n);
        return r;
    };

    function getSiblings(n) {
        if (!n) {
            return [];
        }

        return getChildren(n.parentNode.firstChild, n);
    }

    function getForbiddenElements() {
        return forbiddenElementsString.concat(userExcludedElements);
    }

    function isForbidden(node) {
        return getForbiddenElements().indexOf(getSafeTagName(node).toLowerCase()) !== -1;
    }

    return {
        extract: extract
    };
};