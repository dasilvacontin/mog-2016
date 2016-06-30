const C = require('../src/constants.js')
var clone = require('clone')
class Turn {
  constructor (board, bikes, inputs) {
    this.board = board
    this.bikes = bikes
    this.inputs = inputs
  }
  setInput (pos, input) {
    this.inputs[pos] = input
  }
  evolve () {
    var newBoard = clone(this.board)
    var newBikes = clone(this.bikes)
    var newInputs = []
    for (var i = 0; i < this.bikes.length; i++) {
      if (!(this.inputs[i] === null) && newBikes[i].alive) {
        if (this.inputs[i] === C.SELF_DESTRUCT) {
          newBikes[i].alive = false
        }
        if (this.inputs[i] === C.UP & this.bikes[i].dir !== C.DOWN) {
          newBikes[i].dir = this.inputs[i]
        }
        if (this.inputs[i] === C.DOWN & this.bikes[i].dir !== C.UP) {
          newBikes[i].dir = this.inputs[i]
        }
        if (this.inputs[i] === C.LEFT & this.bikes[i].dir !== C.RIGHT) {
          newBikes[i].dir = this.inputs[i]
        }
        if (this.inputs[i] === C.RIGHT & this.bikes[i].dir !== C.LEFT) {
          newBikes[i].dir = this.inputs[i]
        }
      }
      if (newBikes[i].alive) {
        if (newBikes[i].dir === C.UP) {
          newBikes[i].i--
        } else if (newBikes[i].dir === C.DOWN) {
          newBikes[i].i++
        } else if (newBikes[i].dir === C.RIGHT) {
          newBikes[i].j++
        } else if (newBikes[i].dir === C.LEFT) {
          newBikes[i].j--
        }
        var num = newBoard[newBikes[i].i]
        if (!(num === undefined)) {
          num = num[newBikes[i].j]
        }

        if (num === undefined) {
          newBikes[i].alive = false
        } else if (num !== 0) {
          newBikes[i].alive = false
          if (newBikes[i].i === newBikes[num - 1].i & newBikes[i].j === newBikes[num - 1].j) {
            newBikes[num - 1].alive = false
          }
        } else {
          newBoard[newBikes[i].i][newBikes[i].j] = i + 1
        }
      }
      newInputs.push(null)
    }
    for (var x = 0; x < newBoard.length; x++) {
      for (var y = 0; y < newBoard[x].length; y++) {
        if (newBoard[x][y] !== 0) {
          if (newBikes[newBoard[x][y] - 1].alive !== true) {
            newBoard[x][y] = 0
          }
        }
      }
    }

    return new Turn(newBoard, newBikes, newInputs)
  }
}
exports.Turn = Turn
