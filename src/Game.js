const { Turn } = require('../src/Turn.js')

class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.board = []
    this.bikes = []
    this.inputs = []
    this.minsize = 3
    this.maxsize = 8
    this.turn = null
  }
  isCellFree (ci, cj) {
    return (this.board[ci][cj] === 0)
  }
  newGame () {
    /* If it is the first player, initialize the board */
    if (this.players.lenght === 1) {
      this.bsize = (Math.random() * (this.maxsize - this.minsize) + this.minsize) | 0
      for (var i = 0; i < this.bsize; ++i) {
        this.board[i] = []
        for (var j = 0; j < this.bsize; ++j) this.board[i][j] = 0
      }
    }

    /* Add to bikes array */
    var bi = (Math.random() * (this.bsize - 1)) | 0
    var bj = (Math.random() * (this.bsize - 1)) | 0
    const bdir = (Math.random() * 3) | 0

    while (!this.isCellFree(bi, bj)) {
      bi = (Math.random() * (this.bsize - 1)) | 0
      bj = (Math.random() * (this.bsize - 1)) | 0
    }
    this.bikes.push({i: bi, j: bj, dir: bdir, alive: true})
    this.inputs.push(null)

    const cboard = this.board.map(row => row.slice())
    const cbikes = Object.assign({}, this.bikes)
    const cinputs = this.inputs.map(row => row.slice())

    return new Turn(cboard, cbikes, cinputs)
  }
  onPlayerJoin (psocket) {
    /* Search for null */
    var s = 0
    while (s < this.sockets.length && this.socket[s] != null) ++s
    s = s < this.sockets.length ? s : this.sockets.length

    /* Assign player id */
    this.players[psocket.id] = s
    this.sockets[s] = psocket

    this.turn = this.newGame()
    const game = Object.assign({}, this)
    /* send turn to other players */
    for (var p = 0; p < this.sockets.length; ++p) {
      if (this.socket[p] != null) {
        this.sockets[p].emit('game:state', game)
      }
    }
  }
}

exports.Game = Game
