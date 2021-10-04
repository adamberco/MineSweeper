// function renderBoard(mat, selector) {
//     var strHTML = '<table border="0" class="board"><tbody>';
//     for (var i = 0; i < mat.length; i++) {
//         strHTML += '<tr>';
//         for (var j = 0; j < mat[0].length; j++) {
//             var cell = mat[i][j];
//             var cell = mat[i][j];
//             var className = 'cell cell' + i + '-' + j;
//             strHTML += `<td class="${className}">${cell}</td>`
//         }
//         strHTML += '</tr>'
//     }
//     strHTML += '</tbody></table>';
//     var elContainer = document.querySelector(selector);
//     elContainer.innerHTML = strHTML;
// }

function creatrMat(size) {
    var mat = [];
    for (var i = 0; i < size; i++) {
        mat[i] = [];
        for (var j = 0; j < size; j++) {
            mat[i][j] = mat[i][j];
        }
    }
    return mat;
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] === EMPTY) emptyCells.push({ i: i, j: j })
        }
    }
    return emptyCells
}

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function timer() {
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'HI'


    miliseconds++
    if (miliseconds === 99) {
        miliseconds = 0
        seconds++
    }
    if (seconds === 59) {
        seconds = 0
        mint++
    }
    elTimer.innerText = (seconds < 10) ? `${'0' + mint}:${'0' + seconds}:${miliseconds + '0'}` : `${'0' + mint}:${seconds}:${miliseconds + '0'}`
}