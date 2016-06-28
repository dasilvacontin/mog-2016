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
    for (var i = 0; i < this.inputs.length; ++i) {
      if (this.inputs[i] !== null) {
        this.bikes[num].dir = dir
        switch (dir) {
          case 1:
            if (this.bikes[num].i > 0) {
              this.bikes[num].i -= 1
            }
            break
          case 2:
            if (this.bikes[num].i < this.blenght) {
              this.bikes[num].i += 1
            }
            break
          case 3:
            if (this.bikes[num].j < this.blenght) {
              this.bikes[num].j += 1
            }
            break
          case 4:
            if (this.bikes[num].j > 0) {
              this.bikes[num].j -= 1
            }
            break
          default:
            throw new Error('Not a valid direction of movement')
        }
        this.board[i][j] = 1
      }
    }
    newboard = this.board.map(lst => lst.slice())
    newbikes = this.bikes.map(obj => Object.assign({},obj))
    return new Turn(newboard,newbikes,[null])
  }  
}
exports.Turn = Turn
