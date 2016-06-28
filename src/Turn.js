const C = require('./constants.js')

class Turn {
  constructor (board, bikes, inputs) {
    this.board = board.slice()
    this.inputs = inputs
    this.bikes = []
    for (var i = 0; i < bikes.length; i++) {
      this.bikes.push({ i: bikes[i].i, j: bikes[i].j, dir: bikes[i].dir })
    }
  }

  setInput (p, dir) {
    if (this.inputs[p] == null) {
      this.inputs[p] = -1
    }
    this.inputs[p] = dir
  }

  evolve () {
    for (var i = 0; i < this.bikes.length; ++i) {
      if (this.inputs[i] != null) {
        this.bikes[i].dir = this.inputs[i]
      }
      var posY = this.bikes[i].i
      var posX = this.bikes[i].j
      switch (this.bikes[i].dir) {
        case C.UP: posY--
          break
        case C.DOWN: posY++
          break
        case C.LEFT: posX--
          break
        case C.RIGHT: posX++
          break
      }
      this.bikes[i].i = posY
      this.bikes[i].j = posX
      if (posX >= 0 && posY >= 0 && posX < this.board.length && posY < this.board.length) {
        this.board[posY][posX] = i + 1
      } else {
        console.log('Player ' + i + ' is dead')
      }
    }
    return new Turn(this.board, this.bikes, [null, null])
  }
}
exports.Turn = Turn
