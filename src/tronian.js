const io = require('socket.io-client')
const socket = io('http://localhost:3000')
const C = require('./constants')
// const {Game} = require('./Game.js')

const IncForDir = {
  [C.RIGHT]: {i: 0, j: 1},
  [C.DOWN]: {i: 1, j: 0},
  [C.LEFT]: {i: 0, j: -1},
  [C.UP]: {i: -1, j: 0}
}

function goodTile (board, i, j) {
  if (i < 0 || i >= board.length) return false
  if (j < 0 || j >= board[i].length) return false
  return board[i][j] === 0
}

function onGameState (game) {
  let myId = game.players['/#' + this.id]
  let bike = game.turn.bikes[myId]
  let myDir = bike.dir
  if (goodTile(game.turn.board, bike.i + IncForDir[myDir].i, bike.j + IncForDir[myDir].j)) return
  else {
    myDir = (myDir + 1) % 4
    socket.emit('changeDir', myDir)
  }
}

socket.on('connect', () => {
  socket.on('game:state', onGameState)
})
