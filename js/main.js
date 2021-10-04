'use strict'

/*   To DO:

~initGame()~
This is called when page loads

~buildBoard()~ DONE
Builds the board
Set mines at random locations
Call setMinesNegsCount()
Return the created board

~setMinesNegsCount(board)~ DONE
Count mines around each cell and set the cell's minesAroundCount.

~renderBoard(board)~ DONE
Render the board as a <table> to the page

~cellClicked(elCell, i, j)~ DONE
Called when a cell (td) is clicked

~cellMarked(elCell)~  DONE
Called on right click to mark a cell (suspected to be a mine)
Search the web (and implement) how to hide the context menu on right click

~checkGameOver()~ DONE
Game ends when all mines are marked, && and all the other cells are shown

~expandShown(board, elCell,i, j)~ HAlF DONE
When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
BONUS: if you have the time later, try to work more like the real algorithm (see description
at the Bonuses section below)

 */

// o Beginner (4*4 with 2 MINES)
// o Medium (8 * 8 with 12 MINES)
// o Expert (12 * 12 with 30 MINES)

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gFirstMove = false
var gElMines = document.querySelector('.mines')
var minesLeft = gLevel.MINES

var gElTimer = document.querySelector('.timer')
var gSeconds = 0
var gMinuts = 0
var gInterval



function initGame() {
    gFirstMove = false
    document.querySelector('h1').innerText = "MINE SWEEPER"
    document.querySelector('.smiley').innerText = '😊'
    minesLeft = gLevel.MINES
    gSeconds = 0
    gMinuts = 0
    clearInterval(gInterval)
    gInterval = null
    gElTimer.innerText = `00:00`
    gGame.isOn = true
    gBoard = buildBoard(gLevel)
    renderBoard(gBoard, '.board-container')

}

// creating the model
function buildBoard(lvl) {
    var board = [];
    for (var i = 0; i < lvl.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < lvl.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    addRndMines(board) // adding random mines to the board

    // adding minesAround prop to the emptey cells
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
    return board;
}

//   render the board to the DOM
function renderBoard(mat, selector) {
    var strHTML = '<table class="board"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = (mat[i][j].isMine) ? MINE : ''
            var cell = ''
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onmousedown="cellClicked(this, ${i}, ${j},event)">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    var elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

    const board = document.querySelector('.board') // disabling the contextmenu in rightckick
    board.addEventListener('contextmenu', e => {
        e.preventDefault()
    })

    gElMines.innerText = `${minesLeft} ${FLAG} ` // render how many flags left in the header
}

// count the mines around given cell:
function setMinesNegsCount(board, i, j) {
    var cellI = i
    var cellJ = j
    var count = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) count++
        }
    }
    return count;
}

function timer() {
    gSeconds++
    if (gSeconds === 59) {
        gSeconds = 0
        gMinuts++
    }
    gElTimer.innerText = (gSeconds < 10) ? `${'0' + gMinuts}:${'0' + gSeconds} ` : `${'0' + gMinuts}:${gSeconds}`
}

function cellClicked(elCell, i, j, ev) {

    if (!gGame.isOn) return
    if (!gFirstMove) {
        gFirstMove = true
        gInterval = setInterval(timer, 1000)
    }

    if (ev.button === 0) {  // if Mouse Key is Left

        if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return

        if (!gBoard[i][j].isMine) { //  NOT MINE
            gBoard[i][j].isShown = true
            if (gBoard[i][j].minesAroundCount === 0) {
                elCell.innerText = EMPTY
                expandShown(gBoard, elCell, i, j)
            } else elCell.innerText = gBoard[i][j].minesAroundCount
            elCell.style.backgroundColor = "#ffd3d3"
            gGame.shownCount++
        }

        if (gBoard[i][j].isMine) { //    MINE!!
            gBoard[i][j].isShown = true
            elCell.innerText = MINE
            elCell.style.backgroundColor = "#d13a3a"
            resetGame(false)
        }

    } else if (ev.button === 2) cellMarked(elCell, i, j) // if Mouse Key is Right

    if (checkGameOver()) resetGame(true)
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        elCell.innerText = EMPTY
        gBoard[i][j].isMarked = false
        minesLeft++
        if (minesLeft > gLevel.MINES) minesLeft = gLevel.MINES
        gElMines.innerText = `${minesLeft} ${FLAG} `
        gGame.markedCount--
    } else if (!gBoard[i][j].isMarked) {
        elCell.innerText = FLAG
        gBoard[i][j].isMarked = true
        minesLeft--
        if (minesLeft < 0) minesLeft = 0
        gElMines.innerText = `${minesLeft} ${FLAG} `
        if (gBoard[i][j].isMine) gGame.markedCount++
    }
}

function expandShown(board, elCell, i, j) {
    var cellI = i
    var cellJ = j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currElCell = document.querySelector(`.cell${i}-${j}`)
            if (!gBoard[i][j].isShown) gGame.shownCount++
            gBoard[i][j].isShown = true
            currElCell.style.backgroundColor = "#ffd3d3"
            currElCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? EMPTY : gBoard[i][j].minesAroundCount
        }

    }
}

function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        return true
    }
    else false
}

function resetGame(isWon) {
    gGame.isOn = false
    gFirstMove = false
    document.querySelector('h1').innerText = (isWon) ? 'WINNER!!' : 'LOSER!!'
    document.querySelector('.smiley').innerText = (isWon) ? '😎' : '🤯'

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gSeconds = 0
    gMinuts = 0
    clearInterval(gInterval)
    gInterval = null
}

function addRndMines(board) {
    var count = 0
    while (count !== gLevel.MINES) {
        var idxI = getRandomInt(0, gLevel.SIZE)
        var idxJ = getRandomInt(0, gLevel.SIZE)

        if (board[idxI][idxJ].isMine) continue
        board[idxI][idxJ] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        }
        count++

    }
}
