const io = require('socket.io-client')
// const SERVER_IP = 'http://localhost:5000'
const SERVER_IP = 'http://mog2016-tron.herokuapp.com/'
// const SERVER_IP = 'https://lit-waters-26157.herokuapp.com/'
var socket = io(SERVER_IP)
const C = require('./constants')
const {Game} = require('./Game.js')
const {Turn} = require('./Turn.js')
const game = new Game()
let intervalId
var following = true

const IncForDir = {
  [C.RIGHT]: {i: 0, j: 1},
  [C.DOWN]: {i: 1, j: 0},
  [C.LEFT]: {i: 0, j: -1},
  [C.UP]: {i: -1, j: 0}
}

const IncForDirLeft = {
  [C.RIGHT]: {i: -1, j: 1},
  [C.DOWN]: {i: 1, j: 1},
  [C.LEFT]: {i: 1, j: -1},
  [C.UP]: {i: -1, j: -1}
}

const IncForDirRight = {
  [C.RIGHT]: {i: 1, j: 1},
  [C.DOWN]: {i: 1, j: -1},
  [C.LEFT]: {i: -1, j: -1},
  [C.UP]: {i: -1, j: 1}
}

function goodTile (board, i, j) {
  if (i < 0 || i >= board.length) return false
  if (j < 0 || j >= board[i].length) return false
  return board[i][j] === 0
}

function sizeOfLand (board, i, j, visited) {
  if (visited === undefined) {
    visited = Array(board.length).fill().map(() => Array(board[0].length).fill().map(() => false))
  }
  if (i >= board.length || j >= board[0].length || i < 0 || j < 0 ||
    visited[i][j] || !goodTile(board, i, j)) return 0
  else {
    visited[i][j] = true
    return sizeOfLand(board, i + 1, j, visited) +
    sizeOfLand(board, i - 1, j, visited) +
    sizeOfLand(board, i, j + 1, visited) +
    sizeOfLand(board, i, j - 1, visited) + 1
  }
}

function onGameState (state, turnIndex) {
  const { board, bikes, inputs } = state.turn
  const turn = new Turn(board, bikes, inputs)

  game.turn = turn
  game.turns = [turn]
  game.players = state.players
  game.nTurn = turnIndex

  socket.emit('changeDir', C.UP, 1)

  // game.tick()
  // game.tick()

  clearInterval(intervalId)
  intervalId = setInterval(() => {
    simulate()
    game.tick()
  }, state.interval)
}

function simulate () {
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
    // following = false
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
  let dir = bike.dir
  if (dir !== myDir && !(goodTile(game.turn.board, bike.i + IncForDir[dir].i, bike.j + IncForDir[dir].j)) ||
      dir === myDir && !(goodTile(game.turn.board, bike.i + IncForDirLeft[dir].i, bike.j + IncForDirLeft[dir].j)) &&
      !(goodTile(game.turn.board, bike.i + IncForDirRight[dir].i, bike.j + IncForDirRight[dir].j))) {
    let sizeOne = sizeOfLand(game.turn.board, bike.i + IncForDir[myDir].i, bike.j + IncForDir[myDir].j)
    let auxDir = (dir + 3) % 4
    let sizeTwo = sizeOfLand(game.turn.board, bike.i + IncForDir[auxDir].i, bike.j + IncForDir[auxDir].j)
    if (sizeTwo > sizeOne) myDir = auxDir
    console.log(sizeOne, sizeTwo)
  }
  socket.emit('changeDir', myDir, game.nTurn)
  // console.log(bike, myDir)
}

function onChangeDir (socketId, dir, turnIndex) {
  if (socketId === `/#${socket.id}`) return
  game.onChangeDir({ id: socketId }, dir, turnIndex)
}

socket.on('connect', () => {
  socket.on('game:state', onGameState)
  console.log('connected')
  socket.on('changeDir', onChangeDir)
})
