const { Turn } = require('../src/Turn.js')
const C = require('../src/constants.js')

class Game {
  constructor ({ size = 10 } = {}) {
    const board = Array(size).fill().map(() => Array(size).fill(C.EMPTY_CELL))
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
    this.players = {}
    this.sockets = []
  }

  hasStarted () {
    return this.turns.length > 1
  }

  canGameStart () {
    const connected = this.sockets.filter(socket => {
      return socket
    })
    return connected.length > 1
  }

  onPlayerJoin (socket) {
    let bikeId = 0
    while (this.sockets[bikeId] != null) ++bikeId
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    if (!this.hasStarted()) this.turn.addPlayer(bikeId)
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
  }

  tick () {
    if (this.hasStarted() || this.canGameStart()) {
      const aliveBikes = this.turn.bikes.filter(bike => bike && bike.alive)
      let nextTurn

      if (aliveBikes.length < 2) {
        console.log('new game!')
        nextTurn = new Turn()
        nextTurn.board = this.turn.board.map(row => row.map(cell => 0))
        this.sockets.forEach((socket, i) => {
          if (socket) nextTurn.addPlayer(i)
          else nextTurn.bikes[i] = null
        })
        nextTurn.inputs = nextTurn.bikes.map(() => null)
        this.turns = []
      } else nextTurn = this.turn.evolve()

      this.turns.push(nextTurn)
      this.turn = nextTurn
      this.sendState()
    }
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
