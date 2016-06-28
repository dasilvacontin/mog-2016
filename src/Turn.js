const C = require('../src/constants.js')
const clone = require('clone')
const Utils = require('../src/utils.js')
class Turn {
  constructor (board = [], bikes = [], inputs = [null]) {
    this.inputs = inputs
    this.bikes = bikes
    this.board = board
    this.evolved = false
  }

  setInput (playerId, input) {
    if (!this.evolved) {
      //  protect from going backwards
      if (!Utils.backwards(this.bikes[playerId].dir, input)) {
        this.inputs[playerId] = input
      }
    }
  }

  evolve () {
    this.evolved = true
    var newBoard = clone(this.board)
    var newBikes = []
    var newInputs = []
    for (let i = 0; i < this.bikes.length; ++i) {
      if (this.bikes[i].alive) {
        var newI = this.bikes[i].i
        var newJ = this.bikes[i].j
        var newDir = this.inputs[i] == null ? this.bikes[i].dir : this.inputs[i]
        if (Utils.backwards(newDir, this.bikes[i].dir)) {
          newDir = this.bikes[i].dir
        }
        switch (newDir) {
          case C.UP:
            newI -= 1
            newDir = C.UP
            break
          case C.DOWN:
            newI += 1
            newDir = C.DOWN
            break
          case C.LEFT:
            newJ -= 1
            newDir = C.LEFT
            break
          case C.RIGHT:
            newJ += 1
            newDir = C.RIGHT
            break
        }
        newBikes[i] = {i: newI, j: newJ, dir: newDir, alive: true}
        newInputs[i] = null
      }
    }
    //  Kill bikes
    for (let i = 0; i < newBikes.length; ++i) {
      //  Bike against wall
      if (newBikes[i].i < 0 || newBikes[i].j < 0) {
        newBikes[i].alive = false
      } else if (newBoard[newBikes[i].i][newBikes[i].j] !== 0) {
        //  Position occupied by bike or trail
        newBikes[i].alive = false
      }
      //  Two positions of newPositions overlap (bang)
      //  Kill both bikes
      for (let j = i + 1; j < newBikes.length; ++j) {
        if (newBikes[i].i === newBikes[j].i && newBikes[i].j === newBikes[j].j) {
          newBikes[i].alive = false
          newBikes[j].alive = false
        }
      }
    }
    //  Update board
    for (let i = 0; i < newBoard.length; ++i) {
      for (let j = 0; j < newBoard.length; ++j) {
        var bikeId = newBoard[i][j]

        if (bikeId > 0) {
          if (!newBikes[bikeId - 1].alive) {
            newBoard[i][j] = 0
          }
        }
      }
    }
    for (let i = 0; i < newBikes.length; ++i) {
      if (newBikes[i].alive) {
        newBoard[newBikes[i].i][newBikes[i].j] = i + 1
      }
    }
    return new Turn(newBoard, newBikes, newInputs)
  }
}
exports.Turn = Turn
