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
      if (this.turn.bikes.filter(bike => bike && bike.alive).length < 2) {
        this.restartGame()
      } else {
        const nextTurn = this.turn.evolve()
        this.turns.push(nextTurn)
        this.turn = nextTurn
        this.sendState()
      }
    }
  }

  restartGame () {
    var board = this.turn.board.map(row => row.map(cell => 0))
    this.turn = new Turn(board, [], [])
    this.turns = [this.turn]
    this.sockets.forEach((socket, i) => {
      if (socket) this.turn.addBike(i)
      else this.turn.bikes[i] = null
    })
    this.sendState()
  }

  sendState () {
    this.sockets.forEach(s => { s && s.emit('game:state', { players: this.players, turn: this.turn }, this.turns.length - 1) })
  }

  onPlayerJoin (socket) {
    var bikeId = 0
    while (this.sockets[bikeId] != null) bikeId++
    this.sockets[bikeId] = socket
    this.players[socket.id] = bikeId
    if (this.turns.length < 2) this.turn.addBike(bikeId)
    this.sendState()
  }

  onChangeDir (socket, dir, turn) {
    if (turn == null || turn >= this.turns.length - 1) turn = this.turns.length - 1
    this.turns[turn].setInput(this.players[socket.id], dir)
    let crrTurn = this.turns[turn]
    for (let i = turn + 1; i < this.turns.length; ++i) {
      let nextTurn = this.turns[i]
      const nextInput = nextTurn.inputs
      nextTurn = crrTurn.evolve()
      nextTurn.inputs = nextInput
      this.turns[i] = nextTurn
      crrTurn = nextTurn
    }
    this.turn = crrTurn
  }

  onPlayerLeave (socket) {
    this.sockets[this.players[socket.id]] = null
    this.turn.setInput(this.players[socket.id], C.SELF_DESTRUCT)
    if (this.turns.length < 2) this.turn = this.turn.evolve()
    delete this.players[socket.id]
  }
}
exports.Game = Game
