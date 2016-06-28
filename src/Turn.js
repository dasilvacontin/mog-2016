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
  isNotOppositeDirection (dir1, dir2) {
    const sumdirs = dir1 + dir2
    if (sumdirs === 1 || sumdirs === 5) {
      return false
    }
    return true
  }
  killBike (bikeId) {
    const bike = this.bikes[bikeId]
    bike.alive = false
    this.board = this.board.map(lst => lst.map(item => {
      if (item === bikeId + 1) {
        item = 0
      } }))
  }
  evolve () {
    for (var iter = 0; iter < this.inputs.length; ++iter) {
      const newdir = this.inputs[iter]
      var olddir = this.bikes[iter].dir
      if (newdir !== null && this.isNotOppositeDirection(olddir, newdir)) {
        olddir = newdir
      }
    }
    for (var newiter = 0; newiter < this.bikes.length; ++newiter) {
      const bike = this.bikes[newiter]
      switch (bike.dir) {
        case 0:
          if (bike.i > 0) {
            bike.i -= 1
          }
          break
        case 1:
          if (bike.i < this.blenght) {
            bike.i += 1
          }
          break
        case 2:
          if (bike.j < this.blenght) {
            bike.j += 1
          }
          break
        case 3:
          if (bike.j > 0) {
            bike.j -= 1
          }
          break
        default:
          throw new Error('Not a valid direction of movement')
      }
      var actualPos = this.board[bike.i][bike.j]
      if (actualPos === 0) {
        actualPos = newiter + 1
      } else if (actualPos === -1) {
        this.killBike(newiter)
      } else {
        this.killBike(newiter)
        /* Num of other bike */
        actualPos -= 1
        if (bike[actualPos].i === bike.i && bike[actualPos].j === bike.j) {
          this.killBike(actualPos)
        }
        actualPos = -1
      }
    }
    /* Get rid of -1 */
    this.board = this.board.map(lst => lst.map(item => {
      if (item === -1) {
        item = 0
      } }))
    var newboard = this.board.map(lst => lst.slice())
    var newbikes = this.bikes.map(obj => Object.assign({}, obj))
    var newinput = this.inputs.map(item => null)
    return new Turn(newboard, newbikes, newinput)
  }
}
exports.Turn = Turn
