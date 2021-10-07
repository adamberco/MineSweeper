'use strict'

/*
TO DO:

Best Score :Keep the best score in local storage (per level) and show it on the page 10-12 DONE

Manually positioned mines 12-14 DONE

Undo 14 - 16

7 BOOM! 16-18 

*/

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const HEART = '💖'
const HINT = '💡'

const soundClick = new Audio('../sounds/click.wav')
const soundGameOver = new Audio('../sounds/game-over.wav')
const soundMine = new Audio('../sounds/mine.wav')
const soundFlag = new Audio('../sounds/flag.wav')
const soundWin = new Audio('../sounds/win.wav')
const soundStart = new Audio('../sounds/start.wav')


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

var gPrevBoard

var gHistory

var gLevel = {
    SIZE: 8,
    MINES: 12
}

var gFirstMove = true
var gHint = false
var gManuallyMode = false
var gSevenBoom = false

var gH1 = document.querySelector('h1')
var gSmiley = document.querySelector('.smiley')

var gElMines = document.querySelector('.mines')
var gMinesLeft = gLevel.MINES

var gElTimer = document.querySelector('.timer')
var gInterval

var gSafeClick = 3
var gElSafeClick = document.querySelector('.safe-click')

var gManuallMineCount = gLevel.MINES

var elbScore = document.querySelector('.b-score')
var elmScore = document.querySelector('.m-score')
var eleScore = document.querySelector('.e-score')


function initGame() {
    soundStart.play()
    clearInterval(gInterval)
    gInterval = null
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minsPassed: 0
    }
    gManuallMineCount = gLevel.MINES
    gGame.isOn = true
    gFirstMove = true
    gH1.innerText = (gManuallyMode) ? 'Manuall Mode!' : "MINE SWEEPER"
    gSmiley.innerText = (gManuallyMode) ? '🧐' : '😊'
    gElHeart1.innerText = HEART
    gElHeart2.innerText = (gLevel.SIZE === 4) ? EMPTY : HEART
    gElHeart3.innerText = HEART
    gElHint1.innerText = HINT
    gElHint2.innerText = HINT
    gElHint3.innerText = HINT
    gElSafeClick.innerText = 'Safe Click x 3'
    gSafeClick = 3
    gElTimer.innerText = '00:00'
    elbScore.innerText = (localStorage['b-score'] === undefined) ? '00:00' : localStorage['b-score']
    elmScore.innerText = (localStorage['m-score'] === undefined) ? '00:00' : localStorage['m-score']
    eleScore.innerText = (localStorage['e-score'] === undefined) ? '00:00' : localStorage['e-score']
    gMinesLeft = gLevel.MINES
    gBoard = buildBoard(gLevel)
    gPrevBoard = copyMat(gBoard)
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
            var cell = ''
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onmousedown="cellClicked(this, ${i}, ${j},event)" oncontextmenu= "cellMarked(this, ${i},${j})")  >${cell}</td>`
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

//  filling the board after first click or when all mines in place in manual mode
function fillBoard(board) {
    // adding random mines to the board if not in manuall mode
    if (gManuallyMode === false && gSevenBoom === false) {
        addRndMines(board)
    }
    else if (gManuallyMode === true) {
        gManuallyMode = false
        gFirstMove = false
    } else if (gSevenBoom === true) {
        gSevenBoom = false
        sevenBoomMines()
    }

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

    gPrevBoard = copyMat(gBoard)

    if (ev.button === 0) {  // if Mouse Key is Left

        if (gManuallyMode) {
            placeMine(i, j)
            return
        }

        if (gHint) {  // give hint by click
            getHint(i, j)
            return
        }

        if (gFirstMove) { // adding the mines and nums after first click
            gFirstMove = false
            gInterval = setInterval(timer, 1000)
            gBoard[i][j].isShown = true
            fillBoard(gBoard)
            soundClick.play()

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
            soundClick.play();
        }
        else { //    MINE!!
            elCell.innerText = MINE
            elCell.style.backgroundColor = "#d13a3a"
            soundMine.play()
            decreasedLife(elCell)
        }

    }

    if (checkGameOver()) resetGame(true)
}

//  respond to a rightclick on a cell
function cellMarked(elCell, i, j) {

    if (gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) { // Not Marked Cell
        gBoard[i][j].isMarked = true // model
        elCell.innerText = FLAG //  DOM
        soundFlag.play()
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
    if (checkGameOver()) resetGame(true)
}

// open recursively all 0 negs ,negs cells
function expandShown(board, elCell, i, j) {
    var negs = []
    elCell.style.backgroundColor = "#C56824"
    var cellI = i
    var cellJ = j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (gBoard[i][j].isMarked || gBoard[i][j].isMine) continue
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isShown) {
                negs.push({ i: i, j: j })
            }
            var currElCell = document.querySelector(`.cell${i}-${j}`)
            if (!gBoard[i][j].isShown) gGame.shownCount++
            gBoard[i][j].isShown = true
            currElCell.style.backgroundColor = "#C56824"
            currElCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? EMPTY : gBoard[i][j].minesAroundCount
        }
    }
    if (!negs.length) return
    for (var i = 0; i < negs.length; i++) {
        var inxI = negs[i].i
        var inxJ = negs[i].j
        var currElCell = document.querySelector(`.cell${inxI}-${inxJ}`)
        expandShown(gBoard, currElCell, inxI, inxJ)
    }
}

//  decreas hearts from the header when click on a mine
function decreasedLife(elCell) {

    if (gElHeart1.innerText === HEART) {
        gElHeart1.innerText = '💀'
        gH1.innerHTML = 'Life Lost!!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 500)
        return
    }

    if (gElHeart2.innerText === HEART) {
        gElHeart2.innerText = '💀'
        gH1.innerHTML = 'One more Down!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 500)
        return
    }

    if (gElHeart3.innerText === HEART) {
        gElHeart3.innerText = '💀'
        gH1.innerHTML = 'Last One!!'
        setTimeout(() => {
            elCell.innerText = EMPTY
            gH1.innerHTML = 'MINE SWEEPER'
            elCell.style.backgroundColor = 'white'
            return
        }, 500)
    }
    else {
        resetGame(false)
    }
}

// check the conditions for game over
function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        return true
    }
    else false
}

// reset the game
function resetGame(isWon) {
    gFirstMove = true

    gH1.innerText = (isWon) ? 'WINNER!!' : 'You Lost - Try again'
    gSmiley.innerText = (isWon) ? '😎' : '🤯'
    if (!isWon) {
        soundGameOver.play()
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) {
                    var currElCell = document.querySelector(`.cell${i}-${j}`)
                    currElCell.innerText = MINE
                }
            }
        }
    } else {
        soundWin.play()
        checkHighScore(gLevel.SIZE)
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

var countIter = 0

// add random mines in the board
function addRndMines(board) {
    var countIter = 0

    var count = 0
    while (count !== gLevel.MINES) {
        var idxI = getRandomInt(0, gLevel.SIZE)
        var idxJ = getRandomInt(0, gLevel.SIZE)
        countIter++
        if (board[idxI][idxJ].isMine || board[idxI][idxJ].isShown) continue
        board[idxI][idxJ] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        }
        count++
    }
    console.log(countIter)
}

// timer
function timer() {
    gGame.secsPassed++
    if (gGame.secsPassed === 59) {
        gGame.secsPassed = 0
        gGame.minsPassed++
    }
    gElTimer.innerText = (gGame.secsPassed < 10) ? `${'0' + gGame.minsPassed}:${'0' + gGame.secsPassed} ` : `${'0' + gGame.minsPassed}:${gGame.secsPassed}`
}

// change the board in case of lvl change
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

// switch for hint mode
function hintMode(elHint) {
    if (gFirstMove) return
    if (elHint.innerText === EMPTY) return

    gHint = true
}

//open a cell and his negs for few seconds
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
                currElCell.innerText = (gBoard[i][j].isMarked) ? FLAG : EMPTY

            }
        }
    }, 1000)

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

//mark an empty and safe cell to click 
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
        }, 1000)
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

// update the highscore board and the local storage
function checkHighScore(lvlSize) {
    switch (lvlSize) {
        case 4:
            var lvl = 'b-score'
            break
        case 8:
            var lvl = 'm-score'
            break
        case 12:
            var lvl = 'e-score'
            break
    }
    var prevScore = localStorage[lvl]
    var currScore = document.querySelector('.timer').innerText
    if (prevScore === undefined || currScore < prevScore) {
        localStorage[lvl] = currScore
        document.querySelector(`.${lvl}`).innerText = currScore
        gH1.innerText = 'WINNER - and a New High Score!'
    }
}
// switch for manual mode
function manuallMode() {
    gManuallyMode = !gManuallyMode
    initGame()
}
//  place mine im manual mode
function placeMine(i, j) {
    if (gBoard[i][j].isMine) return
    var currElCell = document.querySelector(`.cell${i}-${j}`)
    gBoard[i][j].isMine = true
    currElCell.innerText = MINE
    gManuallMineCount--
    gElMines.innerText = gManuallMineCount + FLAG

    if (gManuallMineCount === 0) { // start the game when all mines in place
        fillBoard(gBoard)
        gSmiley.innerText = '😊'
        gH1.innerText = 'START GAME!'
        gElMines.innerText = gLevel.MINES + FLAG
        gInterval = setInterval(timer, 1000)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                document.querySelector(`.cell${i}-${j}`).innerText = EMPTY
            }
        }
    }
}


function sevenBoomMood() {
    gSevenBoom = true
    initGame()
}

function sevenBoomMines() {
    var count = 1
    var minescount = 0
    gSmiley.innerText = '7️⃣'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (count % 7 === 0 || count % 10 === 7) {
                gBoard[i][j].isMine = true
                minescount++
            }
            count++
        }
    }
    gLevel.MINES = minescount
    gElMines.innerText = minescount + FLAG

}


function undo() {
    if (gFirstMove) return
    console.log('UNDO');
    for (var i = 0; i < gPrevBoard.length; i++) {
        for (var j = 0; j < gPrevBoard[0].length; j++) {
            var prevCell = gPrevBoard[i][j]
            var currCell = gBoard[i][j]
            var elCell = document.querySelector(`.cell${i}-${j}`)

            if (currCell.isMarked && !prevCell.isMarked) {
                elCell.innerText = EMPTY
                elCell.style.backgroundColor = 'white'
                prevCell.isMarked = false
                gMinesLeft++
                gElMines.innerText = `${gMinesLeft} ${FLAG} `
                if (currCell.isMine) gGame.markedCount--

            }
            if (currCell.isShown && !prevCell.isShown) {
                elCell.innerText = EMPTY
                elCell.style.backgroundColor = 'white'
                prevCell.isShown = false
                gGame.shownCount--
            }
        }
    }
    if (gGame.shownCount === 0) return
    gBoard = copyMat(gPrevBoard)
}