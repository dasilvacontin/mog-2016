/* global myCanvas */
const io = require('socket.io-client')
const { Game } = require('./Game.js')
const C = require('./constants.js')

const game = new Game()
const socket = io()
socket.on('game:state', (state) => {
  game.players = state.players
  game.turn = state.turn
})

const edge = 50
myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

const colors = ['black', 'blue', 'red']

function renderGame () {
  const turn = game.turn
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const color = colors[cell]
      ctx.fillStyle = color
      ctx.fillRect(j * (edge + 5), i * (edge + 5), edge, edge)
    }
  }
}

renderGame()
setInterval(function () { renderGame() }, 500)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
}

const DIR_FOR_KEY = {
  [KEY.W]: C.UP,
  [KEY.A]: C.LEFT,
  [KEY.S]: C.DOWN,
  [KEY.D]: C.RIGHT
}

document.addEventListener('keydown', function (e) {
  const dir = DIR_FOR_KEY[e.keyCode]
  if (dir == null) return
  socket.emit('changeDir', dir)
})
