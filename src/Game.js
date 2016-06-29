const { Turn } = require('./Turn.js')
const C = require('./constants.js')

class Game {

  constructor (boardSize) {
    var board = []
    for (let i = 0; i < boardSize; ++i) {
      var a = []
      for (let j = 0; j < boardSize; ++j) a.push(0)
      board.push(a)
    }
    this.board = board
    this.bikes = []
    this.inputs = []
    this.sockets = []
    this.players = {}
    this.nPlayers = 0
  }

  onPlayerJoin (socket) {
    console.log('playerConnected')

    let nPlayer = this.nPlayers
    for (let i = 0; i < nPlayer; ++i) {
      if (socket[i] == null) {
        nPlayer = i
      }
    }
    if (nPlayer !== -1) {
      this.sockets[nPlayer] = socket
    } else {
      this.sockets.push(socket)
    }

    this.players[socket.id] = nPlayer
    this.bikes.push({ i: 0, j: 0, dir: C.RIGHT, alive: true })

    this.inputs = []
    for (let i = 0; i < this.bikes.length; ++i) {
      this.inputs.push(null)
    }

    this.nPlayers++

    this.turn = new Turn(this.board, this.bikes, this.inputs)
    this.sockets.forEach(s => s.emit('game:state'))
  }

  onChangeDir (socket, dir) {
    this.turn.setInput(this.players[socket.id], dir)
  }

  onPlayerLeave (socket) {
    console.log('playerLeave')
    delete this.players[socket.id]
  }
}
exports.Game = Game
