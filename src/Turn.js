const C = require('../src/constants.js')
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
    var newBoard = this.board
    var newBikes = this.bikes
    for (var i = 0; i < this.bikes.length; i++) {
      newBikes[i].dir = this.inputs[i]
      if (this.bikes[i].dir === C.UP) {
        newBikes[i].i--
      } else if (this.bikes[i].dir === C.DOWN) {
        newBikes[i].i++
      } else if (this.bikes[i].dir === C.RIGHT) {
        newBikes[i].j--
      } else if (this.bikes[i].dir === C.LEFT) {
        newBikes[i].j++
      }
      newBoard[newBikes[i].i][newBikes[i].j] = 1
    }
    return new Turn(newBoard, newBikes, [null])
  }
}
exports.Turn = Turn
