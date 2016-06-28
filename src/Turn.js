class Turn {
  constructor (board, bikes, inputs) {
    this.board = board
    this.bikes = bikes
    this.inputs = inputs
    this.blength = board[0].length - 1
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
        return 0
      } else {
        return item
      } }))
  }
  evolve () {
    for (var iter = 0; iter < this.inputs.length; ++iter) {
      const newdir = this.inputs[iter]
      var olddir = this.bikes[iter].dir
      console.log(this.isNotOppositeDirection(olddir, newdir))
      if (newdir !== null && this.isNotOppositeDirection(olddir, newdir)) {
        olddir = newdir
      }
    }
    for (var newiter = 0; newiter < this.bikes.length; ++newiter) {
      const bike = this.bikes[newiter]
      switch (bike.dir) {
        case 0:
          bike.i -= 1
          break
        case 1:
          bike.i += 1
          break
        case 2:
          bike.j += 1
          break
        case 3:
          bike.j -= 1
          break
        default:
          throw new Error('Not a valid direction of movement')
      }
      /* Out of limits */
      if (bike.i < 0 || bike.i > this.blength || bike.j < 0 || bike.j > this.blength) {
        this.killBike(newiter)
      } else {
        /* Check if it crashes with other bikes */
        var actualPos = this.board[bike.i][bike.j]
        if (actualPos === 0) {
          actualPos = newiter + 1
        } else if (actualPos === -1) {
          this.killBike(newiter)
        } else {
          this.killBike(newiter)
          /* Num of other bike */
          actualPos -= 1
          if (this.bikes[actualPos].i === bike.i && this.bikes[actualPos].j === bike.j) {
            this.killBike(actualPos)
          }
          actualPos = -1
        }
      }
    }
    /* Get rid of -1 */
    this.board = this.board.map(lst => lst.map(item => {
      if (item === -1) {
        return 0
      } else {
        return item
      } }))
    var newboard = this.board.map(lst => lst.slice())
    var newbikes = this.bikes.map(obj => Object.assign({}, obj))
    var newinput = this.inputs.map(item => null)
    return new Turn(newboard, newbikes, newinput)
  }
}
exports.Turn = Turn
