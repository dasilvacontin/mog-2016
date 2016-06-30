'use strict'
var { Turn } = require('./Turn.js')
const C = require('./constants.js')
class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.turn = new Turn([], [], [])
  }
  onPlayerJoin (socket) {
    var nplayer = 0
    while (this.sockets[nplayer] !== null & nplayer < this.sockets.length) nplayer++
    if (nplayer === this.sockets.length) this.sockets.push(socket)
    else this.sockets[nplayer] = socket
    this.players[socket.id] = nplayer
    this.turn.bikes.push({ i: 0, j: 0, dir: C.UP, alive: true })
    this.turn.inputs.push(null)
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i] !== null) this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
  onPlayerLeave (socket) {
    var nplayer = this.players[socket.id]
    this.sockets[nplayer] = null
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
