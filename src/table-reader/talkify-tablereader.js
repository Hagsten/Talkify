talkify = talkify || {};

//Idé att playlist kan ge stafettpinnen till en annan komponent och sen återta. T.ex om en tabell ligger med i flödet så kan playlisten skippa de elementen..
//Bör också kunna läsa tabell med knapptryck.

//1. Simple left to right
//2. Repeat header of each cell

talkify.tableReader = function () {
    function addTables(tables) {
        var tablesToRead = [];

        if ((typeof tables) === "string") {
            tablesToRead = document.querySelectorAll(tables);
        } else {
            tablesToRead = tables;
        }

        tablesToRead = Array.prototype.slice.call(tablesToRead);

        markTables(tablesToRead);
    }

    function markTables(tablesToRead) {
        for (var j = 0; j < tablesToRead.length; j++) {
            var table = tablesToRead[j];

            table.classList.add("talkify-tts-table");

            var headerCells = table.querySelectorAll('th');
            var bodyCells = table.querySelectorAll('td');

            var cols = bodyCells.length / headerCells.length;
            var currentHeader = 0;

            for (var i = 0; i < bodyCells.length; i++) {
                if (i % cols === 0) {
                    currentHeader = 0;
                }

                var headerCell = headerCells[currentHeader];
                bodyCells[i].setAttribute("data-talkify-prefix", headerCell.innerText);
                bodyCells[i].classList.add("talkify-tts-tablecell");

                currentHeader++;
            }
        }
    }

    return {
        markTables: addTables
    }
}();
//http://demo.readspeaker.com/?p=hl.tabl&l=en-us