const io = require('socket.io-client')
// const SERVER_IP = 'http://localhost:3000'
// const SERVER_IP = 'http://mog2016-tron.herokuapp.com/'
const SERVER_IP = 'https://lit-waters-26157.herokuapp.com/'
var socket = io(SERVER_IP)
const C = require('./constants')
// const {Game} = require('./Game.js')

var following = false

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
  if (myId == null) {
    following = false
    return
  }
  let bike = game.turn.bikes[myId]
  if (bike == null) {
    following = false
    return
  }
  if (!bike.alive) {
    console.log('ha muerto... waiting')
    following = false
    return
  }
  if (bike.i == null || bike.j == null) return
  let myDir = ((bike.dir + (following ? 1 : 0)) + 4) % 4
  let i = 0
  // let inc = Math.random() < 0.5 ? -1 : 1
  let inc = -1
  while (!(goodTile(game.turn.board, bike.i + IncForDir[myDir].i, bike.j + IncForDir[myDir].j)) && i++ < 4) {
    myDir = ((myDir + inc) + 4) % 4
    following = true
    // console.log('No era buena la primera')
  }
  socket.emit('changeDir', myDir)
  // console.log(bike, myDir)
}

socket.on('connect', () => {
  socket.on('game:state', onGameState)
  console.log('connected')
})
