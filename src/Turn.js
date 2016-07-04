const C = require('../src/constants.js')
class Turn {
  constructor (board = [], bikes = [], inputs = []) {
    this.board = board
    this.newboard = []
    this.bikes = bikes
    this.newbikes = []
    this.inputs = inputs
    this.blength = 0
  }
  setInput (num, dir) {
    this.inputs[num] = dir
  }
  dirForPos (bi, bj) {
    this.blength = this.board[0].length
    var bdir = 0
    const midb = this.blength / 2 | 0
    const mbi = midb + bi
    const mbj = midb + bj
    if (bi <= midb) bdir = C.DOWN  /* UP OR MIDDLE */
    else bdir = C.UP  /* DOWN */
    // console.log('bi = ' + bi + ' bj = ' + bj + ' midb = ' + midb)
    if (bj <= midb) bdir = (bdir === C.DOWN && bi <= bj) || (bdir === C.UP && bi <= mbj) ? bdir : C.RIGHT
    else bdir = (bdir === C.DOWN && mbi <= bj) || (bdir === C.UP && bi <= bj) ? C.LEFT : bdir
    return bdir
  }
  isNotOppositeDirection (dir1, dir2) {
    return (dir1 + dir2 !== C.UP + C.DOWN) && (dir1 + dir2 !== C.RIGHT + C.LEFT)
  }
  killBike (bikeId) {
    const bike = this.newbikes[bikeId]
    bike.alive = false
    this.newboard = this.newboard.map(lst => lst.map(item => item === bikeId + 1 ? -1 : item))
  }
  evolve () {
    this.newboard = this.board.map(lst => lst.slice())
    this.newbikes = this.bikes.map(obj => Object.assign({}, obj))
    this.blength = this.board[0].length - 1

    for (var iter = 0; iter < this.inputs.length; ++iter) {
      const newdir = this.inputs[iter]
      var olddir = this.newbikes[iter].dir
      if (newdir !== null && this.isNotOppositeDirection(olddir, newdir)) {
        this.newbikes[iter].dir = newdir
      }
    }
    for (var newiter = 0; newiter < this.newbikes.length; ++newiter) {
      if (this.newbikes[newiter] != null) {
        var bike = this.newbikes[newiter]
        if (bike.alive) {
          switch (bike.dir) {
            case C.UP: bike.i -= 1; break
            case C.DOWN: bike.i += 1; break
            case C.RIGHT: bike.j += 1; break
            case C.LEFT: bike.j -= 1; break
            case C.SELF_DESTRUCT: this.killBike(newiter); break
            default:
              throw new Error('Not a valid direction of movement: ' + bike.dir)
          }
          if (bike.alive) {
            this.newbikes[newiter] = bike
            /* Out of limits */
            if (bike.i < 0 || bike.i > this.blength || bike.j < 0 || bike.j > this.blength) {
              this.killBike(newiter)
            } else {
              /* Check if it crashes with other bikes */
              var actualPos = this.newboard[bike.i][bike.j]
              if (actualPos === 0) {
                this.newboard[bike.i][bike.j] = newiter + 1
              } else if (actualPos === -1) {
                this.killBike(newiter)
              } else {
                this.killBike(newiter)
                /* Num of other bike */
                actualPos -= 1
                if (this.newbikes[actualPos].i === bike.i && this.newbikes[actualPos].j === bike.j) {
                  this.killBike(actualPos, this.newbikes, this.newboard)
                }
              }
            }
          }
        }
      }
    }
    /* Get rid of -1 */
    this.newboard = this.newboard.map(lst => lst.map(item => item === -1 ? 0 : item))

    var newinput = this.inputs.map(item => null)
    return new Turn(this.newboard, this.newbikes, newinput)
  }
}
exports.Turn = Turn
