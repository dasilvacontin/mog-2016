const { Turn } = require('../src/Turn.js')
const C = require('../src/constants.js')

class Game {
  constructor ({ size = 10 } = {}) {
    const board = Array(size).fill().map(() => Array(size).fill(C.EMPTY_CELL))
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
    this.players = {}
    this.sockets = []
    this.started = false
  }

  onPlayerJoin (socket) {
    let bikeId = 0
    while (this.sockets[bikeId] != null || this.turn.inputs[bikeId] != null) ++bikeId
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    if (!this.started) {
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
    // check whether there are players on the board
    this.started = false
    for (let i = 0; i < this.sockets.length; ++i) {
      this.started = this.sockets[i] != null
    }
  }

  checkStarted () {
    // check whether there are players on the board, minimum 2
    this.started = false
    let count = 0
    for (let i = 0; i < this.sockets.length; ++i) {
      if (this.sockets[i] != null) {
        ++count
      }
    }
    this.started = count >= 2
  }
  tick () {
    this.checkStarted()
    if (this.started) {
      const nextTurn = this.turn.evolve()
      this.turns.push(nextTurn)
      this.turn = nextTurn
    }
    this.sendState()
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
