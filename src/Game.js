const {Turn} = require('./Turn.js')
const C = require('./constants.js')

class Game {
  constructor () {
    const size = 50
    let matrix = Array(size).fill().map(() => Array(size).fill().map(() => 0))
    this.turn = new Turn(matrix, [], [])
    this.players = {}
    this.sockets = []
    this.currentTurn = 0
    this.turns = []
    this.turns[this.currentTurn] = this.turn
    this.running = false
  }

  restartGame () {
    this.sockets.forEach((s) => {
      if (s == null) return
      let pos = this.players[s.id]
      if (!(this.turn.bikes[pos]) || this.turn.bikes[pos].alive) return
      let x = Math.floor(Math.random() * (this.turn.board[0].length - 1))
      let y = Math.floor(Math.random() * (this.turn.board.length - 1))
      this.turn.inputs[pos] = null
      this.turn.bikes[pos] = { i: y, j: x, dir: C.DOWN, alive: true }
      this.turn.board[y][x] = pos + 1
    })
    this.currentTurn = 0
    this.turns = []
    this.turns[this.currentTurn] = this.turn
    this.running = true
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
      this.sockets[pos] = socket
      this.players[socketid] = pos
      if (this.currentTurn === 0) {
        this.turn.board[y][x] = pos + 1
        this.turn.bikes[pos] = { i: y, j: x, dir: C.DOWN, alive: true }
        this.turn.inputs[pos] = null
      }
    } else {
      this.players[socketid] = this.turn.inputs.length
      this.sockets.push(socket)
      if (this.currentTurn === 0) {
        this.turn.bikes.push({ i: y, j: x, dir: C.DOWN, alive: true })
        this.turn.inputs.push(null)
        this.turn.board[y][x] = this.turn.inputs.length
      }
    }
    this.sendState()
  }

  onPlayerLeave (socket) {
    let pos = this.players[socket.id]
    delete this.players[socket.id]
    this.sockets[pos] = null
    this.turn.setInput(pos, C.SELF_DESTRUCT)
  }

  onChangeDir (socket, dir, nTurn) {
    if (nTurn !== undefined && nTurn !== this.currentTurn) {
      console.log(`va tarde ${nTurn} y debería ser el ${this.currentTurn}`)
      let auxTurn = this.turns[nTurn]
      if (auxTurn === undefined) {
        console.log('el turno que ha pedido no existe')
        return
      }
      auxTurn.setInput(this.players[socket.id], dir)
      for (let i = nTurn + 1; i <= this.currentTurn; ++i) {
        auxTurn = auxTurn.evolve()
        this.turns[i] = auxTurn
      }
      this.turn = auxTurn
    } else {
      this.turn.setInput(this.players[socket.id], dir)
    }
  }

  tick () {
    if (this.turn.bikes.filter((b) => b.alive).length <= 1) {
      if (this.running) this.restartGame()
      return
    } else if (!this.running) this.restartGame()
    this.turn = this.turn.evolve()
    this.currentTurn += 1
    this.sendState()
    this.turns[this.currentTurn] = this.turn
    // delete this.turns[this.currentTurn - 200]
  }

  sendState () {
    this.sockets.forEach((s) => {
      if (s) s.emit('game:state', {turn: this.turn, players: this.players, nTurn: this.currentTurn})
    })
  }
}

exports.Game = Game
