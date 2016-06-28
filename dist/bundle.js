(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const C = require('./constants.js')

class Turn {
  constructor (board, bikes, inputs) {
    this.board = board.map(row => row.slice())
    this.bikes = bikes.map(bike => ({ i: bike.i, j: bike.j, dir: bike.dir, alive: bike.alive }))
    this.inputs = inputs
  }

  setInput (p, dir) {
    this.inputs[p] = dir
  }

  evolve () {
    var tempBoard = this.board.map(row => row.slice())
    var tempBikes = this.bikes.map(bike => ({ i: bike.i, j: bike.j, dir: bike.dir, alive: bike.alive }))

    for (let i = 0; i < tempBikes.length; ++i) {
      const bike = tempBikes[i]
      const input = this.inputs[i]

      if (input != null && this.isOppositeDirection(input, bike.dir)) {
        bike.dir = input
      }
      switch (bike.dir) {
        case C.UP: bike.i--; break
        case C.DOWN: bike.i++; break
        case C.LEFT: bike.j--; break
        case C.RIGHT: bike.j++; break
      }

      if (bike.j >= 0 && bike.i >= 0 && bike.i < tempBoard.length &&
        bike.j < tempBoard[bike.i].length && tempBoard[bike.i][bike.j] === 0) {
        tempBoard[bike.i][bike.j] = i + 1
      } else {
        bike.alive = false
      }
    }

    for (let i = 0; i < tempBikes.length; i++) {
      for (let j = i + 1; j < tempBikes.length; j++) {
        if (tempBikes[i].i === tempBikes[j].i && tempBikes[i].j === tempBikes[j].j) {
          tempBikes[i].alive = false
          tempBikes[j].alive = false
        }
      }
    }

    for (let i = 0; i < tempBoard.length; ++i) {
      for (let j = 0; j < tempBoard[i].length; ++j) {
        var cell = tempBoard[i][j]
        if (cell > 0 && tempBikes[cell - 1].alive === false) {
          tempBoard[i][j] = 0
        }
      }
    }

    return new Turn(tempBoard, tempBikes, [null, null])
  }

  isOppositeDirection (d, b) {
    if ((d === C.LEFT || d === C.RIGHT) && (b === C.LEFT || b === C.RIGHT)) {
      return false
    } else if ((d === C.UP || d === C.DOWN) && (b === C.UP || b === C.DOWN)) {
      return false
    }
    return true
  }
}
exports.Turn = Turn

},{"./constants.js":2}],2:[function(require,module,exports){
module.exports = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
}

},{}],3:[function(require,module,exports){
/* global myCanvas */
const { Turn } = require('./Turn.js')
const C = require('./constants.js')

const edge = 10
const offset = 2
myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

var board = []
for (let i = 0; i < 30; ++i) {
  var a = []
  for (let j = 0; j < 30; ++j) {
    a.push(0)
  }

  board.push(a)
}

let turn = new Turn(board,
[{ i: 0, j: 0, dir: C.RIGHT, alive: true },
{ i: 3, j: 3, dir: C.LEFT, alive: true }], [null, null])

const colors = ['black', 'blue', 'red']

function renderGame () {
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const color = colors[cell]
      ctx.fillStyle = color
      ctx.fillRect(j * (edge + offset), i * (edge + offset), edge, edge)
    }
  }
}

renderGame()
setInterval(function () {
  turn = turn.evolve()
  renderGame()
  console.log('step')
}, 300)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
}

document.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case KEY.S: turn.setInput(0, C.DOWN); break
    case KEY.W: turn.setInput(0, C.UP); break
    case KEY.D: turn.setInput(0, C.RIGHT); break
    case KEY.A: turn.setInput(0, C.LEFT); break
  }
  switch (e.keyCode) {
    case KEY.DOWN: turn.setInput(1, C.DOWN); break
    case KEY.UP: turn.setInput(1, C.UP); break
    case KEY.RIGHT: turn.setInput(1, C.RIGHT); break
    case KEY.LEFT: turn.setInput(1, C.LEFT); break
  }
})

},{"./Turn.js":1,"./constants.js":2}]},{},[3]);
