const C = require('./constants.js')

class Turn {
  constructor (board, bikes, inputs) {
    this.inputs = inputs
  }

  setInput (p, dir) {
    if (this.inputs[p] == null) {
      this.inputs[p] = -1
    }
    this.inputs[p] = dir
  }

  evolve () {
    for (var i = 0; i < this.bikes.length; ++i) {
      }
      }
      } else {
      }
    }
    return new Turn(this.board, this.bikes, [null, null])
    }
  }
}
exports.Turn = Turn
