const clone = require('clone')

const { SELF_DESTRUCT, RIGHT, LEFT, UP, DOWN } = require('./constants.js')

class Turn {
  constructor (board, bikes, inputs) {
    this.board = clone(board)
    this.bikes = clone(bikes)
    this.inputs = clone(inputs)
  }

  setInput (player, direction) {
    this.inputs[player] = direction
  }

  evolve () {
    var nt = new Turn(this.board, this.bikes, this.inputs)
    let nextPositions = {}
    for (let i = 0; i < this.bikes.length; i++) {
      const bike = nt.bikes[i]
      if (bike.alive === false) continue
      let direction = this.inputs[i]
      if (direction === SELF_DESTRUCT) {
        bike.alive = false
        continue
      } else if (direction == null) direction = this.bikes[i].dir
      else direction = writeDirection(bike.dir, direction)
      switch (direction) {
        case RIGHT:
          bike.j += 1
          break
        case LEFT:
          bike.j -= 1
          break
        case UP:
          bike.i -= 1
          break
        case DOWN:
          bike.i += 1
          break
        default:
          console.error('unknown direction')
      }
      bike.dir = direction
      if (tile(nt.board, bike.i, bike.j) !== 0 || tile(this.board, bike.i, bike.j) !== 0) {
        bike.alive = false
      } else if (tile(nt.board, bike.i, bike.j) !== null) {
        let np = nextPositions[bike.i + ',' + bike.j] || []
        np.push(i)
        nextPositions[bike.i + ',' + bike.j] = np
      }
      nt.inputs[i] = null
    }

    for (let pos in nextPositions) {
      if (nextPositions[pos].length > 1) {
        nextPositions[pos].forEach((bikeId) => {
          nt.bikes[bikeId].alive = false
        })
      }
    }

    // for (let i = 0; i < this.bikes.length; i++) {
    //   const bike = nt.bikes[i]
    //   if (tile(nt.board, bike.i, bike.j) !== i + 1) {
    //     bike.alive = false
    //   }
    // }
    // Cleaning dead bikes and moving alive bikes

    nt.bikes.forEach((bike, i) => {
      if (!bike.alive) {
        cleanBoard(nt.board, i + 1, this.bikes[i].i, this.bikes[i].j)
      } else {
        nt.board[bike.i][bike.j] = i + 1
      }
    })

    // for (let i = 0; i < nt.board.length; i++) {
    //   for (let j = 0; j < nt.board[i].length; j++) {
    //     let owner = tile(nt.board, i, j)
    //     if (owner !== 0 && nt.bikes[owner - 1].alive === false) nt.board[i][j] = 0
    //   }
    // }
    return nt
  }
}

function tile (board, i, j) {
  if (i < 0 || i >= board.length) return null
  if (j < 0 || j >= board[i].length) return null
  return board[i][j]
}

function writeDirection (oldDir, newDir) {
  return (oldDir % 2 !== newDir % 2 ? newDir : oldDir)
}

function cleanBoard (board, bikeId, i, j) {
  if (tile(board, i, j) !== bikeId) return
  board[i][j] = 0
  cleanBoard(board, bikeId, i + 1, j)
  cleanBoard(board, bikeId, i - 1, j)
  cleanBoard(board, bikeId, i, j + 1)
  cleanBoard(board, bikeId, i, j - 1)
}

exports.Turn = Turn
