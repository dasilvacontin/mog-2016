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
