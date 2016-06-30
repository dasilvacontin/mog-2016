const { Turn } = require('../src/Turn.js')
const C = require('../src/constants.js')

class Game {
  constructor ({ size = 10 } = {}) {
    const board = Array(size).fill().map(() => Array(size).fill(C.EMPTY_CELL))
    this.size = size
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
    this.players = {}
    this.sockets = []
    this.started = false
  }

  onPlayerJoin (socket) {
    let bikeId = 0
    while (this.sockets[bikeId] != null) { // || this.turn.inputs[bikeId] != null) {
      ++bikeId
    }
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    if (!this.hasStarted()) {
      this.turn.addPlayer(bikeId)
    }
    this.sendState()
  }

  onChangeDir (socket, dir) {
    const bikeId = this.players[socket.id]
    this.turn.setInput(bikeId, dir)
  }

  onPlayerLeave (socket) {
    const bikeId = this.players[socket.id]
    this.turn.setInput(bikeId, C.SELF_DESTRUCT)
    delete this.players[socket.id]
    this.sockets[bikeId] = null
    if (!this.canStart()) {
      // TODO: Should restart when 1 player or less left?
    }
  }

  hasStarted () {
    return this.turns.length > 1
  }

  checkNPlayers (n) {
    // check whether there are connected players on the board
    return this.sockets.filter((socket) => socket != null).length >= n
  }

  canStart () {
    return this.checkNPlayers(C.MIN_PLAYERS)
  }

  tick () {
    if (this.canStart() || this.hasStarted()) {
      const nextTurn = this.turn.evolve()
      this.turns.push(nextTurn)
      this.turn = nextTurn
      if (this.turn.bikes.every(bike => !bike.alive)) {
        this.restart()
      }
    }
    this.sendState()
  }

  restart () {
    const board = Array(this.size).fill().map(() => Array(this.size).fill(C.EMPTY_CELL))
    this.turn.bikes.forEach(bike => { bike.alive = true })
    this.turn.board = board
    this.turns = [this.turn]
    this.started = false
  }

  sendState () {
    const state = {
      turn: this.turn,
      players: this.players
    }
    this.sockets.forEach((socket) => socket && socket.emit('game:state', state))
  }
}
exports.Game = Game
