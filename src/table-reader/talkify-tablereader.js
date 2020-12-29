talkify = talkify || {};

talkify.tableReader = function () {
    function addTables(config) {
        var mapped = config.map(function (cfg) {
            var tablesToRead = [];

            if ((typeof cfg.table) === "string") {
                tablesToRead = document.querySelectorAll(cfg.table);
            } else {
                tablesToRead = cfg.table;
            }

            cfg.tables = Array.prototype.slice.call(tablesToRead);

            return cfg;
        });

        markTables(mapped);
    }

    function getElements(obj) {
        if (!obj) {
            return null;
        }

        if ((typeof obj) === "string") {
            return Array.from(document.querySelectorAll(obj));
        } else {
            return obj;
        }
    }

    function markTables(configurations) {
        for (var j = 0; j < configurations.length; j++) {
            var config = configurations[j];

            for (var k = 0; k < config.tables.length; k++) {
                var table = config.tables[k];

                table.classList.add("talkify-tts-table");

                var headerCells = getElements(config.headerCells) || table.querySelectorAll('th');
                var bodyCells = getElements(config.bodyCells) || table.querySelectorAll('td');

                var cols = headerCells.length;
                var currentHeader = 0;

                for (var i = 0; i < bodyCells.length; i++) {
                    if (i % cols === 0) {
                        currentHeader = 0;
                    }

                    if(!bodyCells[i].innerText.trim()){
                        currentHeader++;
                        continue;
                    }

                    var headerCell = headerCells[currentHeader];

                    if (headerCell.innerText.trim()) {
                        bodyCells[i].setAttribute("data-talkify-prefix", headerCell.innerText);
                    }

                    bodyCells[i].classList.add("talkify-tts-tablecell");

                    currentHeader++;
                }
            }
        }
    }

    return {
        markTables: addTables
    }
}();