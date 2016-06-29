const {Turn} = require('./Turn.js')
const C = require('./constants.js')

class Game {
  constructor () {
    const size = 50
    let matrix = Array(size).fill().map(() => Array(size).fill().map(() => 0))
    this.turn = new Turn(matrix, [], [])
    this.players = {}
    this.sockets = []
  }

  onPlayerJoin (socket) {
    let socketid = socket.id
    let x = Math.floor(Math.random() * (this.turn.board[0].length - 1))
    let y = Math.floor(Math.random() * (this.turn.board.length - 1))
    // console.log(this.players[socketid], x, y)

    let pos = null
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i] === null) {
        pos = i
        break
      }
    }

    if (pos !== null) {
      this.turn.bikes[pos] = { i: y, j: x, dir: C.DOWN, alive: true }
      this.turn.inputs[pos] = null
      this.players[socketid] = pos
      this.sockets[pos] = socket
    } else {
      this.turn.bikes.push({ i: y, j: x, dir: C.DOWN, alive: true })
      this.turn.inputs.push(null)
      this.players[socketid] = this.turn.inputs.length - 1
      this.sockets.push(socket)
    }
    this.sockets.forEach((s) => {
      if (s) s.emit('game:state', {turn: this.turn, players: this.players})
    })
  }

  onPlayerLeave (socket) {
    let pos = this.players[socket.id]
    delete this.players[socket.id]
    this.sockets[pos] = null
  }

  onChangeDir (socket, dir) {
    this.turn.setInput(this.players[socket.id], dir)
  }

  nextTurn () {
    this.turn = this.turn.evolve()
    this.sockets.forEach((s) => {
      if (s) s.emit('game:state', {turn: this.turn, players: this.players})
    })
  }
}

exports.Game = Game
