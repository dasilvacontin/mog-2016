const C = require('../src/constants.js')
const { Turn } = require('../src/Turn.js')

class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.turn = new Turn([], [], [])

    this.minsize = 5
    this.maxsize = 15
    this.bsize = (Math.random() * (this.maxsize - this.minsize) + this.minsize) | 0
    for (var i = 0; i < this.bsize; ++i) {
      this.turn.board[i] = []
      for (var j = 0; j < this.bsize; ++j) this.turn.board[i][j] = 0
    }

    this.turns = [this.turn]
  }
  isCellFree (ci, cj) {
    return (this.turn.board[ci][cj] === 0)
  }
  sendGameState () {
    /* send turn to other players */
    const game = Object.assign({}, this)
    for (var p = 0; p < this.sockets.length; ++p) {
      if (this.sockets[p] != null) this.sockets[p].emit('game:state', game)
    }
  }
  newGame (pid) {
    /* Add to bikes array */
    var bi = (Math.random() * (this.bsize - 1)) | 0
    var bj = (Math.random() * (this.bsize - 1)) | 0

    while (!this.isCellFree(bi, bj)) {
      bi = (Math.random() * (this.bsize - 1)) | 0
      bj = (Math.random() * (this.bsize - 1)) | 0
    }
    var bdir = 0
    const midb = this.bsize / 2 | 0
    const mbi = midb + bi
    const mbj = midb + bj
    if (bi < midb) bdir = C.DOWN  /* UP */
    else bdir = C.UP  /* DOWN OR MIDDLE */
    if (bj < midb) bdir = (bdir === C.DOWN && bi < bj) || (bdir === C.UP && bi < mbj) ? bdir : C.RIGHT
    else bdir = (bdir === C.DOWN && mbi < bj) || (bdir === C.UP && bi < bj) ? C.LEFT : bdir

    // console.log('pos: size= ' + this.bsize + ' i= ' + bi + ' j= ' + bj + ' dir= ' + bdir)
    this.turn.bikes.push({i: bi, j: bj, dir: bdir, alive: true})
    this.turn.board[bi][bj] = pid + 1
    this.turn.inputs.push(null)
  }
  onPlayerJoin (psocket) {
    /* Search for null */
    var s = 0
    while (s < this.sockets.length && this.sockets[s] != null) ++s
    s = s < this.sockets.length ? s : this.sockets.length

    /* Assign player id */
    this.players[psocket.id] = s
    this.sockets[s] = psocket

    if (this.turns.length === 1) {
      this.newGame(s)
    }
    /* send turn to other players */
    this.sendGameState()
  }
  redoTurns (num) {
    for (var i = num; i < this.turns.length - 1; ++i) {
      const newTurn = this.turns[i].evolve()
      const oldInput = this.turns[i + 1].inputs.slice()
      newTurn.inputs = oldInput
      this.turns[i + 1] = newTurn
    }
    this.turn = this.turns[this.turns.length - 1]
    this.sendGameState()
  }
  onChangeDir (psocket, dir, num = -1) {
    const pid = this.players[psocket.id]
    if (num === -1 || num === this.turns.length - 1) {
      this.turn.setInput(pid, dir)
    } else {
      this.turns[num].setInput(pid, dir)
      this.redoTurns(num)
    }
  }
  onPlayerLeave (psocket) {
    const pid = this.players[psocket.id]
    delete this.players[psocket.id]
    this.sockets[pid] = null
    this.turn.setInput(pid, C.SELF_DESTRUCT)
    this.sendGameState()
  }
  isGameFinished () {
    const aliveBikes = this.turn.bikes.filter(obj => obj == null || obj.alive)
    return aliveBikes.length <= 1
  }
  finishGame () {
    this.turn = new Turn([], [], [])
    this.turns = [this.turn]
    for (var i = 0; i < this.bsize; ++i) {
      this.turn.board[i] = []
      for (var j = 0; j < this.bsize; ++j) this.turn.board[i][j] = 0
    }
    for (var p = 0; p < this.sockets.length; ++p) {
      if (this.sockets[p] == null) {
        this.turn.bikes.push(null)
        this.turn.inputs.push(null)
      } else {
        this.newGame(p)
      }
    }
    this.sendGameState()
  }
  tick () {
    if (this.turn.bikes.length > 1) {
      if (this.isGameFinished()) {
        this.finishGame()
      } else {
        this.turn = this.turn.evolve()
        this.turns.push(this.turn)
        this.sendGameState()
      }
    }
  }
}

exports.Game = Game
