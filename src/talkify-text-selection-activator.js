talkify = talkify || {};

talkify.selectionActivator = function () {
    var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'style', 'code', 'rp', 'rt'];
    var timeoutId, playlist, player, originalElement, contextId, x, y, elements, html, controlcenterHtml, currentSelection;
    var currentContext = {};


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
        originalElement = currentContext.range.commonAncestorContainer.cloneNode(true);

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

        console.log(items);

        return items;
    }

    function getNodesInSelection(element, leftToRight) {
        if (element === document.body.parentElement) {
            return [];
        }

        if (element.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, "") === currentContext.text) {
            return [element];
        }

        var nodes = [currentContext.anchorNode];

        nodes = nodes.concat(getNodesInBetween(element, leftToRight));

        if (currentContext.anchorNode !== currentContext.focusNode) {
            nodes.push(currentContext.focusNode);
        }

        if (!leftToRight) {
            nodes.reverse();
        }

        return nodes;
    }

    function getNodesInBetween(element, leftToRight) {
        var nodes = [];

        for (var i = 0; i < element.childNodes.length; i++) {
            var node = leftToRight ?
                element.childNodes[i] :
                element.childNodes[element.childNodes.length - 1 - i];

            var tagName = node.tagName != undefined ? node.tagName.toLowerCase() : undefined;

            if (forbiddenElementsString.indexOf(tagName) !== -1) {
                console.log(node.tagName);
                continue;
            }

            if (node.contains(currentContext.anchorNode)) {
                continue;
            }

            if (node.contains(currentContext.focusNode)) {
                if (node.nodeType === 1) {
                    nodes = nodes.concat(getNodesInBetween(node, leftToRight));
                }

                continue;
            }

            if (currentSelection.containsNode(node, true) && node.textContent.trim() !== "") {
                nodes.push(node);
            }
        }

        return nodes;
    }

    function surroundNode(node, startOffset, endOffset) {
        const range = document.createRange();
        const newParent = document.createElement('span');
        // newParent.style = "background-color: yellow;";
        newParent.setAttribute("data-ctx-id", contextId);

        if (startOffset === 0 && endOffset === 0) {
            if (node.nodeType === 1) {
                newParent.innerHTML = node.innerHTML;
                node.innerHTML = "";
                node.appendChild(newParent);
            } else {
                range.setStart(node, 0);
                range.setEnd(node, node.textContent.length);
                range.surroundContents(newParent);
            }

        } else {
            if (node.nodeType === 1) { 
                newParent.innerHTML = node.innerHTML;
                node.innerHTML = "";
                node.appendChild(newParent);   
            }
            else {
                range.setStart(node, startOffset);
                range.setEnd(node, endOffset);
                range.surroundContents(newParent);
            }
        }

        return newParent;
    }

    function activate() {
        document.onmouseup = document.onkeyup = function (e) {            
            //TODO: placeholder för att om vi har en aktiv markering..
            currentSelection = window.getSelection();

            if(currentContext.anchorNode === currentSelection.anchorNode && currentContext.focusNode === currentSelection.focusNode){
                return;
            }

            if (currentSelection.type === "Range" && currentSelection.toString().trim()) {                
                console.log(currentSelection);
                if (html) {
                    removeActivator();
                }                

                currentContext = {
                    anchorNode: currentSelection.anchorNode,
                    focusNode: currentSelection.focusNode,
                    anchorOffset: currentSelection.anchorOffset,
                    focusOffset: currentSelection.focusOffset,
                    range: currentSelection.getRangeAt(0),                    
                    text: currentSelection.toString().replace(/\s/g, "")                    
                };

                var position = currentContext.anchorNode.compareDocumentPosition(currentContext.focusNode);
                currentContext.leftToRight = !(position & Node.DOCUMENT_POSITION_PRECEDING);

                currentContext.nodes = getElementsInSelection();

                contextId = talkify.generateGuid();

                html = renderActivator();
                
                var preferDown = currentContext.leftToRight || y < 50;

                html.style.left = x + 'px';                
                html.style.top = (y + (preferDown ? 15 : -45)) + 'px';

                document.body.appendChild(html);

                html.addEventListener('click', activateControlcenter, false);

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                timeoutId = setTimeout(function () {
                    removeActivator();
                }, 3000);
            }
        };

        document.addEventListener('mousemove', onMouseUpdate, false);
        document.addEventListener('mouseenter', onMouseUpdate, false);
    }

    function activateControlcenter() {
        html.removeEventListener("click", activateControlcenter, false);
        removeControlcenter();

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        elements = createItemsFromNodes(currentContext.nodes);

        controlCenterHtml = renderControlcenter();
        controlCenterHtml.style.left = html.style.left;
        controlCenterHtml.style.top = html.style.top;

        document.body.appendChild(controlCenterHtml);

        removeActivator();

        if (player) {
            player.dispose();
        }

        player = new talkify.TtsPlayer();
        player.enableTextHighlighting();
        player.forceVoice({ name: 'Zira', description: "Zira" });
        player.useControlCenter("local", controlCenterHtml);

        if (playlist) {
            playlist.dispose();
        }

        playlist = new talkify.playlist()
            .begin()
            .usingPlayer(player)
            .withElements(elements)
            .build();
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
        if (!html) {
            return;
        }

        html.innerHTML = "";
        document.body.removeChild(html);
        html = null;

        currentContext = {};
    }

    function onMouseUpdate(e) {
        x = e.pageX;
        y = e.pageY;
    }

    function renderActivator() {
        var div = document.createElement('div');
        div.classList.add("talkify-activator-wrapper");

        div.innerHTML = '<div class="talkify-popup-activator">\
                            <i class="fas fa-universal-access fa-2x"/>\
                        </div>';

        return div;
    }

    function renderControlcenter() {
        var div = document.createElement('div');
        div.classList.add("talkify-controlcenter-wrapper");
        return div;
    }

    return {
        activate: activate
    }
}();