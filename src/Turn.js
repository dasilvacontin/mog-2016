var clone = require('clone')

const { RIGHT, LEFT, UP, DOWN } = require('./constants.js')

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
    for (let i = 0; i < this.bikes.length; i++) {
      const bike = nt.bikes[i]
      let direction = this.inputs[i]
      if (direction == null) direction = this.bikes[i].dir
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
      if (tile(nt.board, bike.i, bike.j) !== 0 || tile(this.board, bike.i, bike.j) !== 0) bike.alive = false
      if (tile(nt.board, bike.i, bike.j) !== null) nt.board[bike.i][bike.j] = i + 1
      nt.inputs[i] = null
    }
    for (let i = 0; i < this.bikes.length; i++) {
      const bike = nt.bikes[i]
      if (tile(nt.board, bike.i, bike.j) !== i + 1) {
        bike.alive = false
      }
    }
    for (let i = 0; i < nt.board.length; i++) {
      for (let j = 0; j < nt.board[i].length; j++) {
        let owner = tile(nt.board, i, j)
        if (owner !== 0 && nt.bikes[owner - 1].alive === false) nt.board[i][j] = 0
      }
    }
    return nt
  }
}

function tile (board, i, j) {
  if (i < 0 || i >= board.length) return null
  if (j < 0 || j >= board[i].length) return null
  return board[i][j]
}

function writeDirection (oldDir, newDir) {
  switch (oldDir) {
    case UP:
      if (newDir === DOWN) return oldDir
      break
    case DOWN:
      if (newDir === UP) return oldDir
      break
    case LEFT:
      if (newDir === RIGHT) return oldDir
      break
    case RIGHT:
      if (newDir === LEFT) return oldDir
      break
    default:
      console.error('unknown direction')
  }
  return newDir
}

exports.Turn = Turn
