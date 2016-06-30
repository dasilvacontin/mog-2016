'use strict'
const clone = require('clone')
const C = require('./constants.js')

const IncForDir = {
  [C.RIGHT]: {i: 0, j: 1},
  [C.DOWN]: {i: 1, j: 0},
  [C.LEFT]: {i: 0, j: -1},
  [C.UP]: {i: -1, j: 0}
}

function getCell (board, i, j) {
  const row = board[i]
  return row ? row[j] : undefined
}

function removeBike (board, bikeId, i, j) {
  const cell = getCell(board, i, j)
  if (cell !== bikeId) return

  board[i][j] = 0
  removeBike(board, bikeId, i - 1, j)
  removeBike(board, bikeId, i + 1, j)
  removeBike(board, bikeId, i, j - 1)
  removeBike(board, bikeId, i, j + 1)
}

function directionsAreOpposite (dir1, dir2) {
  return dir1 !== dir2 && dir1 % 2 === dir2 % 2
}

class Turn {
  constructor (board, bikes, inputs) {
    this.board = board
    this.bikes = bikes
    this.inputs = inputs
  }

  setInput (playerIndex, dir) {
    this.inputs[playerIndex] = dir
  }

  clone () {
    const { board, bikes, inputs } = this
    return new Turn(clone(board), clone(bikes), inputs.map(_ => null))
  }

  evolve () {
    const nextTurn = this.clone()
    const { board, bikes } = nextTurn
    const inputs = this.inputs

    // update bike position, and generate a collision hash
    // i.e. a hash of pos -> array of bikes in that pos
    const collisions = {}

    bikes.forEach((bike, i) => {
      if (!bike.alive) return

      const input = inputs[i]
      if (input === C.SELF_DESTRUCT) {
        bike.alive = false
        return
      }

      let nextDir = bike.dir
      if (input !== null && !directionsAreOpposite(input, bike.dir)) {
        nextDir = input
      }
      const dirInc = IncForDir[nextDir]
      bike.i += dirInc.i
      bike.j += dirInc.j
      bike.dir = nextDir

      // out of bounds
      if (bike.i < 0 ||
          bike.i >= board.length ||
          bike.j < 0 ||
          bike.j >= board[0].length) {
        bike.alive = false
        return
      }

      // target cell is already occupied
      if (getCell(board, bike.i, bike.j) !== C.EMPTY_CELL) {
        bike.alive = false
        return
      }

      const posKey = bike.i + 'x' + bike.j
      let colArr = collisions[posKey]
      if (!colArr) colArr = collisions[posKey] = []
      colArr.push(bike)
    })

    // mark colliding bikes as dead
    for (let pos in collisions) {
      const collidingBikes = collisions[pos]
      if (collidingBikes.length < 2) continue
      collidingBikes.forEach(bike => { bike.alive = false })
    }

    // move bikes on the board, remove dead bikes
    const oldBikes = this.bikes
    bikes.forEach((bike, i) => {
      if (bike.alive) board[bike.i][bike.j] = i + 1
      else {
        const oldBike = oldBikes[i]
        removeBike(board, i + 1, oldBike.i, oldBike.j)
      }
    })

    return nextTurn
  }

  addPlayer (bikeId) {
    let i = -1
    let j = -1
    while (getCell(this.board, i, j) !== C.EMPTY_CELL) {
      i = Math.floor(Math.random() * this.board.length)
      j = Math.floor(Math.random() * this.board[0].length)
    }

    const dir = Math.floor(Math.random() * 4)
    const bike = { i, j, dir, alive: true }
    this.bikes[bikeId] = bike
    this.board[i][j] = bikeId + 1
    this.inputs[bikeId] = null
  }
}
exports.Turn = Turn
