const C = require('../src/constants.js')
const { Turn } = require('../src/Turn.js')

class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.bikes = []
    this.inputs = []
    this.minsize = 3
    this.maxsize = 8

    this.board = []
    this.bsize = (Math.random() * (this.maxsize - this.minsize) + this.minsize) | 0
    for (var i = 0; i < this.bsize; ++i) {
      this.board[i] = []
      for (var j = 0; j < this.bsize; ++j) this.board[i][j] = 0
    }

    this.turn = new Turn(this.board, this.bikes, this.inputs)
  }
  isCellFree (ci, cj) {
    return (this.board[ci][cj] === 0)
  }
  newGame (pid) {
    /* Add to bikes array */
    var bi = (Math.random() * (this.bsize - 1)) | 0
    var bj = (Math.random() * (this.bsize - 1)) | 0
    const bdir = (Math.random() * 3) | 0

    while (!this.isCellFree(bi, bj)) {
      bi = (Math.random() * (this.bsize - 1)) | 0
      bj = (Math.random() * (this.bsize - 1)) | 0
    }
    this.bikes.push({i: bi, j: bj, dir: bdir, alive: true})
    this.board[bi][bj] = pid + 1
    this.inputs.push(null)

    // const cboard = this.board.map(row => row.slice())
    // const cbikes = this.bikes.map(obj => Object.assign({}, obj))
    // const cinputs = this.inputs.slice()

    return new Turn(this.board, this.bikes, this.inputs)
  }
  onPlayerJoin (psocket) {
    /* Search for null */
    var s = 0
    while (s < this.sockets.length && this.sockets[s] != null) ++s
    s = s < this.sockets.length ? s : this.sockets.length

    /* Assign player id */
    this.players[psocket.id] = s
    this.sockets[s] = psocket

    this.turn = this.newGame(s)
    const game = Object.assign({}, this)
    /* send turn to other players */
    for (var p = 0; p < this.sockets.length; ++p) {
      if (this.sockets[p] != null) this.sockets[p].emit('game:state', game)
    }
  }
  onChangeDir (psocket, dir) {
    const pid = this.players[psocket.id]
    this.turn.setInput(pid, dir)
  }
  onPlayerLeave (psocket) {
    const pid = this.players[psocket.id]
    delete this.players[psocket.id]
    this.sockets[pid] = null
    this.turn.setInput(pid, C.SELF_DESTRUCT)

    /* send turn to other players */
    const game = Object.assign({}, this)
    for (var p = 0; p < this.sockets.length; ++p) {
      if (this.sockets[p] != null) this.sockets[p].emit('game:state', game)
    }
  }
}

exports.Game = Game
