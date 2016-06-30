/* global myCanvas */

const io = require('socket.io-client')
// const socket = io('http://localhost:3000')
const socket = io()
const {Game} = require('./Game.js')

var interval

var game = new Game()

function onGameState (g) {
  game = g
}

function onInterval (i) {
  interval = i
  setInterval(function () {
    game.tick()
  }, interval)
}

socket.on('connect', () => {
  socket.on('ok', () => console.log('all good'))
  socket.on('game:state', onGameState)
  socket.on('interval', onInterval)
})

// const { Turn } = require('./Turn.js')
const C = require('./constants.js')

myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight

const size = 50
const offsetFactor = 1
const edge = Math.min(window.innerWidth, window.innerHeight) / (size * offsetFactor)
const ctx = myCanvas.getContext('2d')

let matrix = Array(size).fill().map(() => Array(size).fill().map(() => 0))
matrix[0][0] = 1

// let turn = new Turn(matrix
// , [{
//   i: 0,
//   j: 0,
//   dir: C.RIGHT,
//   alive: true
// }], [null])

const colors = ['black', 'red', 'blue', 'cyan', 'purple', 'yellow', 'orange', 'green', 'pink', 'grey', 'teal', 'brown']

function renderGame () {
  for (let i = 0; i < game.turn.board.length; ++i) {
    const row = game.turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const color = colors[cell]
      ctx.fillStyle = color
      ctx.fillRect(j * (edge * offsetFactor), i * (edge * offsetFactor), edge, edge)
    }
  }
}

renderGame()
setInterval(function () {
  renderGame()
}, 10)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
}

document.addEventListener('keydown', function (e) {
  let dir = null
  switch (e.keyCode) {
    case KEY.S:
      dir = C.DOWN
      break
    case KEY.W:
      dir = C.UP
      break
    case KEY.A:
      dir = C.LEFT
      break
    case KEY.D:
      dir = C.RIGHT
      break
    default:
  }
  if (dir === null) return
  console.log(dir)
  socket.emit('changeDir', dir, game.nTurn)
})
