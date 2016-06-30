const { Turn } = require('./Turn.js')
const C = require('./constants.js')

class Game {
  constructor ({ size = 10 } = {}) {
    var board = []
    for (let i = 0; i < size; ++i) {
      var a = []
      for (let j = 0; j < size; ++j) a.push(0)
      board.push(a)
    }

    this.sockets = []
    this.players = {}
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
  }

  tick () {
    const nextTurn = this.turn.evolve()
    this.turns.push(nextTurn)
    this.turn = nextTurn
  }

  onPlayerJoin (socket) {
    var bikeId = 0
    while (this.sockets[bikeId] != null || this.turn.inputs[bikeId] != null) bikeId++
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    this.turn.addBike(bikeId)
    this.sockets.forEach(s => { s && s.emit('game:state', this) })
  }

  onChangeDir (socket, dir) {
    this.turn.setInput(this.players[socket.id], dir)
  }

  onPlayerLeave (socket) {
    this.sockets[this.players[socket.id]] = null
    this.turn.setInput(this.players[socket.id], C.SELF_DESTRUCT)
    delete this.players[socket.id]
  }
}
exports.Game = Game
