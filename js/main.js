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
BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)

 */

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const HEART = '💖'
const HINT = '💡'


var gElHeart1 = (document.querySelector('.heart1'))
var gElHeart2 = (document.querySelector('.heart2'))
var gElHeart3 = (document.querySelector('.heart3'))
var gElHint1 = (document.querySelector('.hint1'))
var gElHint2 = (document.querySelector('.hint2'))
var gElHint3 = (document.querySelector('.hint3'))

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    minsPassed: 0
}

var gBoard

var gLevel = {
    SIZE: 8,
    MINES: 2
}

var gFirstMove = true
var gHint = false

var gH1 = document.querySelector('h1')
var gSmiley = document.querySelector('.smiley')

var gElMines = document.querySelector('.mines')
var gMinesLeft = gLevel.MINES

var gElTimer = document.querySelector('.timer')
var gInterval

var gSafeClick = 3
var gElSafeClick = document.querySelector('.safe-click')



function initGame() {
    clearInterval(gInterval)
    gInterval = null
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minsPassed: 0
    }

    gGame.isOn = true
    gFirstMove = true
    gH1.innerText = "MINE SWEEPER"
    gSmiley.innerText = '😊'
    gElHeart1.innerText = HEART
    gElHeart2.innerText = (gLevel.SIZE === 4) ? EMPTY : HEART
    gElHeart3.innerText = HEART
    gElHint1.innerText = HINT
    gElHint2.innerText = HINT
    gElHint3.innerText = HINT
    gElSafeClick.innerText = 'Safe Click x 3'
    gSafeClick = 3

    gElTimer.innerText = `00:00`
    gMinesLeft = gLevel.MINES
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
    return board;
}

//  render the model to the DOM
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

    gElMines.innerText = `${gMinesLeft} ${FLAG} ` // render how many flags left in the header
}

//  count the mines around given cell:
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

//filling the board after first click
function fillBoard(board) {
    addRndMines(board) // adding random mines to the board

    // adding minesAround prop to the emptey cells
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}

//  respond to the user interaction with the board
function cellClicked(elCell, i, j, ev) {

    if (!gGame.isOn) return

    if (ev.button === 0) {  // if Mouse Key is Left

        if (gHint) {  // give hint by click
            getHint(i, j)
            return
        }

        if (gFirstMove) { // adding the mines and nums after first click
            gFirstMove = false
            gInterval = setInterval(timer, 1000)
            gBoard[i][j].isShown = true
            // gGame.shownCount++
            fillBoard(gBoard)
        } else if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return

        if (!gBoard[i][j].isMine) { //  NOT MINE
            gBoard[i][j].isShown = true
            if (gBoard[i][j].minesAroundCount === 0) {
                expandShown(gBoard, elCell, i, j)
            } else {
                elCell.innerText = gBoard[i][j].minesAroundCount
            }
            elCell.style.backgroundColor = "#C56824"
            gGame.shownCount++
        }
        else { //    MINE!!
            elCell.innerText = MINE
            elCell.style.backgroundColor = "#d13a3a"
            decreasedLife(elCell)
        }

    } else if (ev.button === 2) cellMarked(elCell, i, j) // if Mouse Key is Right

    if (checkGameOver()) resetGame(true)
}

//  respond to a rightclick on a cell
function cellMarked(elCell, i, j) {

    if (gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) { // Not Marked Cell
        gBoard[i][j].isMarked = true // model
        elCell.innerText = FLAG //  DOM

        gMinesLeft-- //update the minesleft in the header
        if (gMinesLeft < 0) gMinesLeft = 0
        gElMines.innerText = `${gMinesLeft} ${FLAG} `

        if (gBoard[i][j].isMine) gGame.markedCount++ // really a mine
    }
    else { // Marked Cell

        gBoard[i][j].isMarked = false // model
        elCell.innerText = EMPTY // DOM

        gMinesLeft++    // update the minesleft in the header
        if (gMinesLeft > gLevel.MINES) gMinesLeft = gLevel.MINES
        gElMines.innerText = `${gMinesLeft} ${FLAG} `

        if (gBoard[i][j].isMine) gGame.markedCount--
    }
}
// open all negs of 0 negs cell
function expandShown(board, elCell, i, j) {
    // debugger

    // var countShown = 0
    elCell.style.backgroundColor = "#ffd3d3"
    var cellI = i
    var cellJ = j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= board[i].length) continue;
            if (gBoard[i][j].isMarked || gBoard[i][j].isMine) continue
            var currElCell = document.querySelector(`.cell${i}-${j}`)

            if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isShown) gGame.shownCount++
            gBoard[i][j].isShown = true
            // countShown++
            // if (countShown === 0) return
            currElCell.style.backgroundColor = "#C56824"
            currElCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? EMPTY : gBoard[i][j].minesAroundCount
            // if (countShown === 0) return
            // expandShown(gBoard, currElCell, cellI - 1, cellJ - 1)
            // if (gBoard[i][j].minesAroundCount > 0) return
            // countShown = 0
        }
    }
}

function decreasedLife(elCell) {

    if (gElHeart1.innerText === HEART) {
        gElHeart1.innerText = EMPTY
        gH1.innerHTML = 'Life Lost!!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 1000)
        return
    }

    if (gElHeart2.innerText === HEART) {
        gElHeart2.innerText = EMPTY
        gH1.innerHTML = 'One more Down!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 1000)
        return
    }

    if (gElHeart3.innerText === HEART) {
        gElHeart3.innerText = EMPTY
        gH1.innerHTML = 'Last One!!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 1000)
    }
    else {
        resetGame(false)
    }
}

function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        return true
    }
    else false
}

function resetGame(isWon) {
    gFirstMove = true

    gH1.innerText = (isWon) ? 'WINNER!!' : 'LOSER!!'
    gSmiley.innerText = (isWon) ? '😎' : '🤯'
    if (!isWon) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) {
                    var currElCell = document.querySelector(`.cell${i}-${j}`)
                    currElCell.innerText = MINE
                }
            }
        }
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minsPassed: 0
    }

    clearInterval(gInterval)
    gInterval = null
}

function addRndMines(board) {
    var count = 0
    while (count !== gLevel.MINES) {
        var idxI = getRandomInt(0, gLevel.SIZE)
        var idxJ = getRandomInt(0, gLevel.SIZE)

        if (board[idxI][idxJ].isMine || board[idxI][idxJ].isShown) continue
        board[idxI][idxJ] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        }
        count++
    }
}

function timer() {
    gGame.secsPassed++
    if (gGame.secsPassed === 59) {
        gGame.secsPassed = 0
        gGame.minsPassed++
    }
    gElTimer.innerText = (gGame.secsPassed < 10) ? `${'0' + gGame.minsPassed}:${'0' + gGame.secsPassed} ` : `${'0' + gGame.minsPassed}:${gGame.secsPassed}`
}

function changeLvl(elBtn) {
    switch (elBtn.innerText) {
        case 'Beginner':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break
        case 'Medium':
            gLevel.SIZE = 8
            gLevel.MINES = 12
            break
        case 'Expert':
            gLevel.SIZE = 12
            gLevel.MINES = 30
            break
    }
    initGame()
}

function hintMode(elHint) {
    if (gFirstMove) return
    if (elHint.innerText === EMPTY) return
    gHint = true
}

function getHint(i, j) {
    var cellI = i
    var cellJ = j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var currElCell = document.querySelector(`.cell${i}-${j}`)
            currElCell.style.backgroundColor = "#C56824"
            currElCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? EMPTY : gBoard
            [i][j].minesAroundCount
            if (gBoard[i][j].isMine) currElCell.innerText = MINE
        }
    }
    setTimeout(function () {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue
                if (gBoard[i][j].isShown) continue
                var currElCell = document.querySelector(`.cell${i}-${j}`)
                currElCell.style.backgroundColor = "white"
                currElCell.innerText = EMPTY
            }
        }
    }, 2000)

    gHint = false

    if (gElHint1.innerText === HINT) {
        gElHint1.innerText = EMPTY
        return
    }

    if (gElHint2.innerText === HINT) {
        gElHint2.innerText = EMPTY
        return
    }

    if (gElHint3.innerText === HINT) {
        gElHint3.innerText = EMPTY
        return
    }

}

function safeClick() {
    if (gFirstMove) return
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) return
    if (gSafeClick === 0) return
    var count = 0

    while (count === 0) {
        var idxI = getRandomInt(0, gLevel.SIZE)
        var idxJ = getRandomInt(0, gLevel.SIZE)
        if (gBoard[idxI][idxJ].isShown || gBoard[idxI][idxJ].isMine) continue
        count++
        var safeCell = document.querySelector(`.cell${idxI}-${idxJ}`)
        safeCell.style.backgroundColor = 'blue'
        setTimeout(function () {
            if (gBoard[idxI][idxJ].isShown) return
            safeCell.style.backgroundColor = 'white'
        }, 2000)
    }
    gSafeClick--
    switch (gSafeClick) {
        case 2:
            gElSafeClick.innerText = 'Safe Click x 2'
            break
        case 1:
            gElSafeClick.innerText = 'Safe Click x 1'
            break
        case 0:
            gElSafeClick.innerText = 'Safe Click finished'
            break
    }
}

