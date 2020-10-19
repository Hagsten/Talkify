talkify = talkify || {};

talkify.selectionActivator = function () {
    var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'];
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'style', 'code', 'rp', 'rt'];
    var timeoutId, playlist, player, x, y, activatorHtml, controlcenterHtml, currentSelection;
    var orchestrateTimeout;
    var activated = false;
    var currentContext = {};
    var settings = {
        exclude: [],
        enhancedVisibility: false,
        voice: { name: 'Zira' },
        highlightText: false,
        buttonText: "Listen",
        rate: 0
    };

    var validNodeTypes = [1, 3];

    function getElementsInSelection() {
        if (!currentSelection) {
            return [];
        }

        var anchorNode = currentContext.anchorNode;

        if (!anchorNode) {
            return [];
        }

        var nodes = getNodesInSelection(currentContext.range.commonAncestorContainer, currentContext.leftToRight);

        return nodes;
    }

    function createItemsFromNodes(nodes) {
        var items = [];

        if (nodes.length === 1) {
            return [surroundNode(nodes[0], currentContext.range.startOffset, currentContext.range.endOffset)];
        }

        for (var i = 0; i < nodes.length; i++) {
            if (i === 0) {
                if (currentContext.leftToRight) {
                    items.push(surroundNode(nodes[i], currentContext.anchorOffset, currentContext.anchorNode.textContent.length))
                } else {
                    items.push(surroundNode(nodes[i], currentContext.focusOffset, currentContext.focusNode.textContent.length))
                }

                continue;
            }

            if (i === nodes.length - 1) {
                if (currentContext.leftToRight) {
                    items.push(surroundNode(nodes[i], 0, currentContext.focusOffset))
                }
                else {
                    items.push(surroundNode(nodes[i], 0, currentContext.anchorOffset))
                }

                continue;
            }

            items.push(surroundNode(nodes[i], 0, 0))
        }

        return items;
    }

    function getNodesInSelection(element, leftToRight) {
        if (element === document.body.parentElement) {
            return [];
        }

        var nodes = getNodesInBetween(element, leftToRight);

        if (!leftToRight) {
            nodes.reverse();
        }

        return nodes;
    }

    function getNodesInBetween(element, leftToRight) {
        var nodes = [];

        if (element.nodeType === 3) {
            return [element];
        }

        var inlineGroups = getInlineGroups(element.childNodes);

        for (var i = 0; i < element.childNodes.length; i++) {
            var node = leftToRight ?
                element.childNodes[i] :
                element.childNodes[element.childNodes.length - 1 - i];

            var tagName = node.tagName != undefined ? node.tagName.toLowerCase() : undefined;

            if (forbiddenElementsString.indexOf(tagName) !== -1 || settings.exclude.indexOf(node) !== -1) {
                continue;
            }

            if (validNodeTypes.indexOf(node.nodeType) === -1) {
                continue;
            }

            if (node.textContent.trim() === "") {
                continue;
            }

            var group = inlineGroups.filter(function (x) { return x.indexOf(node) > -1; })[0];

            if (group) {
                nodes.push(group);

                var indexAfterGroup = i + group.length;
                i = indexAfterGroup;

                continue;
            }

            if (node.nodeType === 1) {
                nodes = nodes.concat(getNodesInBetween(node, leftToRight));
            }

            if (node.nodeType === 1) {
                continue;
            }

            if (currentSelection.containsNode(node, true)) {
                nodes.push(node);
            }
        }

        return nodes;
    }

    function getInlineGroups(nodes) {
        var groups = [];

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if (!currentSelection.containsNode(node, true)) {
                continue;
            }

            var isBlockElement = node.nodeType === 1 && inlineElements.indexOf(node.tagName.toLowerCase()) === -1;

            if (isBlockElement) {
                continue;
            }

            if (validNodeTypes.indexOf(node.nodeType) === -1) {
                continue;
            }

            if (node.textContent.trim() === "") {
                continue;
            }

            var group = [node];

            while (i < nodes.length &&
                node.nextSibling &&
                node.nextSibling.textContent.trim() !== "" &&
                currentSelection.containsNode(node.nextSibling, true) &&
                (node.nextSibling.nodeType === 3 || inlineElements.indexOf((node.nextSibling.tagName || "").toLowerCase()) !== -1)) {
                group.push(node.nextSibling);

                i++;
                node = nodes[i];
            }

            if (group.length > 1) {
                groups.push(group);
            }
        }

        return groups;
    }

    function surroundNode(node, startOffset, endOffset) {
        var range = document.createRange();
        var newParent = document.createElement('span');
        newParent.classList.add("talkify-selected-text");

        if (Array.isArray(node)) {
            var originalNodes = [];
            node[0].parentNode.insertBefore(newParent, node[0]);

            for (var i = 0; i < node.length; i++) {
                newParent.appendChild(node[i].cloneNode(true));

                originalNodes.push(node[i].cloneNode(true));

                node[i].parentNode.removeChild(node[i]);
            }

            return {
                newNode: newParent,
                originalNode: originalNodes
            };
        }

        var original = node.cloneNode(true);

        if (node.nodeType === 1) {
            node.classList.add("talkify-selected-text");

            return {
                newNode: node,
                originalNode: original
            };
        }

        if (startOffset === 0 && endOffset === 0) {
            range.setStart(node, 0);
            range.setEnd(node, node.textContent.length);
            range.surroundContents(newParent);
        } else {
            range.setStart(node, 0);
            range.setEnd(node, node.textContent.length);
            range.surroundContents(newParent);
        }

        return {
            originalNode: original,
            newNode: newParent
        };
    }

    function deactivate() {
        activated = false;

        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('keyup', onMouseUp, false);
    }

    function activate() {
        if (activated) {
            console.warn("Selection activator is already activated");
            return;
        }

        activated = true;

        if (settings.exclude && NodeList.prototype.isPrototypeOf(settings.exclude)) {
            settings.exclude = Array.from(settings.exclude);
        }

        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('keyup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseUpdate, false);
        document.addEventListener('mouseenter', onMouseUpdate, false);

        talkify.domExtensions.recordEvents.begin();
    }

    function onMouseUp(e) {
        currentSelection = window.getSelection();

        if (currentSelection.type === "Range" && currentSelection.toString().trim()) {
            if (currentContext.anchorNode === currentSelection.anchorNode && currentContext.focusNode === currentSelection.focusNode) {
                return;
            }

            if (activatorHtml && (activatorHtml.contains(currentSelection.focusNode) || activatorHtml.contains(currentSelection.anchorNode))) {
                return;
            }

            if (currentContext && currentContext.active) {
                return;
            }

            if (orchestrateTimeout) {
                clearTimeout(orchestrateTimeout);
            }

            orchestrateTimeout = setTimeout(orchestrateAfterSelection, 200);
        }
    }

    function orchestrateAfterSelection() {
        if (currentSelection.rangeCount === 0) {
            return;
        }

        removeActivator();

        currentContext = {
            anchorNode: currentSelection.anchorNode,
            focusNode: currentSelection.focusNode,
            anchorOffset: currentSelection.anchorOffset,
            focusOffset: currentSelection.focusOffset,
            range: currentSelection.getRangeAt(0),
            active: false,
            elements: []
        };

        var position = currentContext.anchorNode.compareDocumentPosition(currentContext.focusNode);
        currentContext.leftToRight = !(position & Node.DOCUMENT_POSITION_PRECEDING);

        currentContext.nodes = getElementsInSelection();

        console.log(currentContext.nodes);

        if (!currentContext.nodes.length) {
            currentContext = {};
            return;
        }

        renderActivator();

        activatorHtml.addEventListener('click', activateControlcenter, false);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(function () {
            removeActivator();
            currentContext = {};
        }, 2000);
    }

    function activateControlcenter() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        currentContext.active = true;

        currentContext.elements = createItemsFromNodes(currentContext.nodes);

        var elements = currentContext.elements.map(function (x) { return x.newNode; });

        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }

        renderControlcenter();
        removeActivator();

        player = new talkify.TtsPlayer({ controlcenter: { name: "local", container: controlcenterHtml } });

        talkify.messageHub.subscribe("text-selection-activator", player.correlationId + ".player.*.disposed", disposeControlCenter);

        if (settings.highlightText) {
            player.enableTextHighlighting();
        }

        player.forceVoice(settings.voice);
        player.setRate(settings.rate);

        if (settings.enhancedVisibility) {
            player.enableEnhancedTextVisibility();
        }

        if (playlist) {
            playlist.dispose();
        }

        playlist = new talkify.playlist()
            .begin()
            .usingPlayer(player)
            .withElements(elements)
            .subscribeTo({ onEnded: disposeControlCenter })
            .build();
    }

    function disposeControlCenter() {
        if (player) {
            talkify.messageHub.unsubscribe("text-selection-activator", player.correlationId + ".player.*.disposed");
            player.dispose();
        }

        if (playlist) {
            playlist.dispose();
        }

        removeControlcenter();

        if (currentContext.range.commonAncestorContainer.nodeType !== 1) {
            var element = currentContext.elements[0];

            if (element) {
                element.newNode.parentElement.replaceChild(element.originalNode, element.newNode);
            }
        }
        else {
            restoreDom();
        }

        currentContext = {};
    }

    function restoreDom() {
        var elements = currentContext.elements;

        for (var i = 0; i < elements.length; i++) {
            var originalNode = elements[i].originalNode;
            var currentNode = elements[i].newNode;

            if (Array.isArray(originalNode)) {
                restoreDomForGroupedNodes(currentNode, originalNode);
            }
            else {
                currentNode.parentElement.replaceChild(originalNode, currentNode);
            }

            var candidatesForEvents = Array.isArray(originalNode) ?
                originalNode.map(function (n) {
                    if (n.getElementsByTagName) {
                        return [n].concat(Array.from(n.getElementsByTagName('*')))
                    }

                    return [n];
                }).flat() :
                [originalNode].concat(originalNode.getElementsByTagName ? Array.from(originalNode.getElementsByTagName('*')) : [])

            var events = candidatesForEvents.map(function (x) {
                return talkify.domExtensions.recordEvents.getEvents(x);
            }).filter(function (x) { return x !== null });

            for (var j = 0; j < candidatesForEvents.length; j++) {
                var element = candidatesForEvents[j];

                var eventsToApply = events
                    .filter(function (x) { return element.isEqualNode(x.node) })
                    .map(function (x) { return x.events })
                    .flat();

                for (var k = 0; k < eventsToApply.length; k++) {
                    var event = eventsToApply[k];

                    element.addEventListener(event.type, event.listener, event.options);
                }
            }
        }
    }

    function restoreDomForGroupedNodes(currentNode, originalNodes) {
        for (var i = 0; i < originalNodes.length; i++) {
            var originalNode = originalNodes[i];
            currentNode.parentElement.insertBefore(originalNode, currentNode);
        }

        currentNode.parentElement.removeChild(currentNode);
    }

    function removeControlcenter() {
        if (!controlcenterHtml) {
            return;
        }

        controlcenterHtml.innerHTML = "";
        document.body.removeChild(controlcenterHtml);
        controlcenterHtml = null;
    }

    function removeActivator() {
        if (!activatorHtml) {
            return;
        }

        activatorHtml.removeEventListener("click", activateControlcenter, false);

        activatorHtml.innerHTML = "";

        if (activatorHtml.parentElement) {
            document.body.removeChild(activatorHtml);
        }

        activatorHtml = null;
    }

    function onMouseUpdate(e) {
        x = e.clientX;
        y = e.clientY;
    }

    function renderActivator() {
        var div = document.createElement('div');
        div.classList.add("talkify-activator-wrapper");

        div.innerHTML = '<div class="talkify-popup-activator">\
                            <button title="Talkify">\
                                <i class="fas fa-play"></i>' +
            settings.buttonText +
            '</button>\
                        </div>';

        activatorHtml = div;

        document.body.appendChild(activatorHtml);

        var preferDown = currentContext.leftToRight || y < 50;

        if (x >= window.outerWidth - 300) {
            x = x - (300 - (window.outerWidth - x));
        }

        activatorHtml.style.left = x + 'px';
        activatorHtml.style.top = (y + (preferDown ? 15 : -45)) + 'px';
    }

    function renderControlcenter() {
        controlcenterHtml = document.createElement('div');
        controlcenterHtml.classList.add("talkify-controlcenter-wrapper");

        var closeButton = document.createElement('div');
        closeButton.classList.add('talkify-close');

        closeButton.innerHTML = "<i class='fa fa-times'/>";

        closeButton.addEventListener("click", disposeControlCenter);

        controlcenterHtml.appendChild(closeButton);

        controlcenterHtml.style.left = activatorHtml.style.left;
        controlcenterHtml.style.top = activatorHtml.style.top;

        document.body.appendChild(controlcenterHtml);
    }

    return {
        withEnhancedVisibility: function () {
            settings.enhancedVisibility = true;
            return this;
        },
        withVoice: function (voice) {
            settings.voice = voice;
            return this;
        },
        withTextHighlighting: function () {
            settings.highlightText = true;
            return this;
        },
        withButtonText: function (text) {
            settings.buttonText = text;
            return this;
        },
        withRate: function(rate){
            settings.rate = rate;
        },
        excludeElements: function (domElements) {
            settings.exclude = domElements;
            return this;
        },
        activate: activate,
        deactivate: deactivate
    }
}();

talkify.domExtensions = {
    recordEvents: function () {
        var events = [];
        var initialized = false;

        function addEventListenerDecorator(type, listener, options) {
            this._addEventListener(type, listener, options);

            events.push({ node: this, type: type, listener: listener, options: options });
        }

        function initialize() {
            if (initialized) {
                return;
            }

            Node.prototype._addEventListener = Node.prototype.addEventListener;
            Node.prototype.addEventListener = addEventListenerDecorator;
            initialized = true;
        }

        function getEvents(node) {
            var result = events.filter(function (e) {
                return e.node.isEqualNode(node);
            });

            if (!result.length) {
                return {
                    events: []
                };
            }

            return {
                node: result[0].node,
                events: result
            };
        }

        return {
            getEvents: getEvents,
            begin: initialize
        }
    }()
}

