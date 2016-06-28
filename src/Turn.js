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
      if (!(this.inputs[i] === null)) {
        newBikes[i].dir = this.inputs[i]
      }

      if (newBikes[i].dir === C.UP) {
        newBikes[i].i--
      } else if (newBikes[i].dir === C.DOWN) {
        newBikes[i].i++
      } else if (newBikes[i].dir === C.RIGHT) {
        newBikes[i].j++
      } else if (newBikes[i].dir === C.LEFT) {
        newBikes[i].j--
      }
      newBoard[newBikes[i].i][newBikes[i].j] = i + 1
      newInputs.push(null)
    }
    return new Turn(newBoard, newBikes, newInputs)
  }
}
exports.Turn = Turn
