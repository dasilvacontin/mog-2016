const { Turn } = require('./Turn.js')
const C = require('./constants.js')

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomEmptyPosition (board) {
  var result = { i: getRandomInt(0, board.length - 1), j: getRandomInt(0, board[0].length) }

  while (board[result.i][result.j] !== C.EMPTY_CELL) {
    result = { i: getRandomInt(0, board.length - 1), j: getRandomInt(0, board[0].length) }
  }
  return result
}

class Game {
  constructor (boardSize = 30) {
    var board = []
    for (let i = 0; i < boardSize; ++i) {
      var a = []
      for (let j = 0; j < boardSize; ++j) a.push(0)
      board.push(a)
    }

    this.sockets = []
    this.players = {}
    this.turn = new Turn(board, [], [])
  }

  onPlayerJoin (socket) {
    const turn = this.turn
    var tempBoard = turn.board.map(row => row.slice())
    var nPlayer = -1

    var cont = 0
    while (nPlayer === -1) {
      if (this.sockets[cont] === null || cont === this.sockets.length) nPlayer = cont
      cont++
    }
    this.sockets.push(socket)
    this.players[socket.id] = nPlayer

    var initPos = getRandomEmptyPosition(tempBoard)

    turn.bikes.push({ i: initPos.i, j: initPos.j, dir: getRandomInt(0, 3), alive: true })
    turn.board[initPos.i][initPos.j] = nPlayer + 1
    turn.inputs.push(null)
    this.sockets.forEach(s => { if (s != null) s.emit('game:state', this) })
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
