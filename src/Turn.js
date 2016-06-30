'use strict'
const C = require('./constants.js')

class Turn {
  constructor (board, bikes, inputs) {
    this.board = board.map(row => row.slice())
    this.bikes = bikes.map(bike => Object.assign({}, bike))
    this.inputs = inputs
  }

  setInput (p, dir) {
    this.inputs[p] = dir
  }

  evolve () {
    var tempBoard = this.board.map(row => row.slice())
    var tempBikes = this.bikes.map(bike => Object.assign({}, bike))
    const collisions = {}
    for (let i = 0; i < tempBikes.length; ++i) {
      const bike = tempBikes[i]
      if (!bike) continue
      const input = this.inputs[i]
      if (input === C.SELF_DESTRUCT) bike.alive = false
      if (bike.alive) {
        if (input != null && isNotOppositeDirection(input, bike.dir)) bike.dir = input
        bike.i += C.VECTOR_DIR[bike.dir].i
        bike.j += C.VECTOR_DIR[bike.dir].j
        // Out of bounds
        if (bike.j < 0 ||
          bike.i < 0 ||
          bike.i >= tempBoard.length ||
          bike.j >= tempBoard[bike.i].length ||
          tempBoard[bike.i][bike.j] !== C.EMPTY_CELL) {
          bike.alive = false
        }
        const posKey = bike.i + 'x' + bike.j
        let colArr = collisions[posKey]
        if (!colArr) {
          colArr = collisions[posKey] = []
        }
        colArr.push(i)
      }
    }

    for (let i = 0; i < tempBikes.length; i++) {
      const bike = tempBikes[i]
      if (!bike) continue
      const oldBike = this.bikes[i]
      if (bike.alive && collisions[bike.i + 'x' + bike.j].length > 1) {
        bike.alive = false
      }
      if (!bike.alive) {
        removeBike(tempBoard, i + 1, oldBike.i, oldBike.j)
      } else {
        tempBoard[bike.i][bike.j] = i + 1
      }
    }
    var newInputs = Array.apply(null, {length: this.inputs.length}).map(value => null)
    return new Turn(tempBoard, tempBikes, newInputs)
  }

  addBike (bikeId) {
    var initPos = getRandomEmptyPosition(this.board)
    this.bikes[bikeId] = { i: initPos.i, j: initPos.j, dir: getRandomInt(0, 3), alive: true }
    this.board[initPos.i][initPos.j] = bikeId + 1
    this.inputs[bikeId] = null
  }
}
exports.Turn = Turn

function removeBike (board, bikeid, i, j) {
  if (j < 0 || i < 0 || i >= board.length || j >= board[i].length) return
  const c = board[i][j]
  if (c === bikeid) {
    board[i][j] = C.EMPTY_CELL
    removeBike(board, bikeid, i + 1, j)
    removeBike(board, bikeid, i - 1, j)
    removeBike(board, bikeid, i, j + 1)
    removeBike(board, bikeid, i, j - 1)
  }
  return
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomEmptyPosition (board) {
  do {
    var result = { i: getRandomInt(0, board.length - 1), j: getRandomInt(0, board[0].length) }
  } while (board[result.i][result.j] !== C.EMPTY_CELL)
  return result
}

function isNotOppositeDirection (d, b) {
  return !(d + b === C.LEFT + C.RIGHT || d + b === C.UP + C.DOWN)
}
