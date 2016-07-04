'use strict'
var { Turn } = require('./Turn.js')
const C = require('./constants.js')
class Game {
  constructor () {
    const board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
    this.players = {}
    this.sockets = []
    this.turn = new Turn(board, [], [])
  }
  onPlayerJoin (socket) {
    var nplayer = 0
    while (this.sockets[nplayer] !== null & nplayer < this.sockets.length) nplayer++
    if (nplayer === this.sockets.length) this.sockets.push(socket)
    else this.sockets[nplayer] = socket
    this.players[socket.id] = nplayer
    var m = 0
    var n = 0
    for (m, n; this.turn.board[m][n] !== 0 && m < this.turn.board.length; n++) {
      if (n === this.turn.board[0].length) {
        n = 0
        ++m
      }
    }
    this.turn.bikes.push({ i: m, j: n, dir: C.UP, alive: true })
    this.turn.board[m][n] = this.turn.bikes.length
    this.turn.inputs.push(null)
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i] !== null) this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
  onPlayerLeave (socket) {
    var nplayer = this.players[socket.id]
    this.sockets[nplayer] = null
    this.turn.inputs[nplayer] = C.SELF_DESTRUCT
    delete this.players[socket.id]
  }
  onChangeDir (socket, dir) {
    this.turn.setInput(this.players[socket.id], dir)
    for (let i = 0; i < this.sockets.length; i++) {
      this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
}
exports.Game = Game
