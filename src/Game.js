const { Turn } = require('./Turn.js')
const C = require('./constants.js')

class Game {
  constructor ({ size = 10 } = {}) {
    var board = Array.apply(null, {length: size}).map(value => Array.apply(null, {length: size}).map(value => 0))
    this.sockets = []
    this.players = {}
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
  }

  tick () {
    if (this.turn.bikes.length > 1) {
      if (this.turn.bikes.filter(bike => bike.alive).length < 2) {
        this.restartGame()
        return
      }
      const nextTurn = this.turn.evolve()
      this.turns.push(nextTurn)
      this.turn = nextTurn
      this.sockets.forEach(s => { s && s.emit('game:state', { players: this.players, turn: this.turn }) })
    }
  }

  restartGame () {
    const size = this.turn.board.length
    var board = Array.apply(null, {length: size}).map(value => Array.apply(null, {length: size}).map(value => 0))
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
    this.sockets.forEach(socket => socket && this.turn.addBike(this.players[socket.id]))
  }

  onPlayerJoin (socket) {
    var bikeId = 0
    while (this.sockets[bikeId] != null) bikeId++
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    if (this.turns.length < 2) this.turn.addBike(bikeId)
    this.sockets.forEach(s => { s && s.emit('game:state', { players: this.players, turn: this.turn }) })
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
