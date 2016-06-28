class Turn {
  constructor (board, bikes, inputs) {
    this.board = board
    this.bikes = bikes
    this.inputs = inputs
    this.blenght = board[0].length - 1
  }
  setInput (num, dir) {
    this.inputs[num] = dir
  }
  evolve () {
    for (var iter = 0; iter < this.inputs.length; ++iter) {
      if (this.inputs[iter] !== null) {
        this.bikes[iter].dir = this.inputs[iter]
        switch (this.inputs[iter]) {
          case 1:
            if (this.bikes[iter].i > 0) {
              this.bikes[iter].i -= 1
            }
            break
          case 2:
            if (this.bikes[iter].i < this.blenght) {
              this.bikes[iter].i += 1
            }
            break
          case 3:
            if (this.bikes[iter].j < this.blenght) {
              this.bikes[iter].j += 1
            }
            break
          case 4:
            if (this.bikes[iter].j > 0) {
              this.bikes[iter].j -= 1
            }
            break
          default:
            throw new Error('Not a valid direction of movement')
        }
        this.board[this.bikes[iter].i][this.bikes[iter].j] = iter + 1
      }
    }
    var newboard = this.board.map(lst => lst.slice())
    var newbikes = this.bikes.map(obj => Object.assign({}, obj))
    return new Turn(newboard, newbikes, [null, null])
  }
}
exports.Turn = Turn
