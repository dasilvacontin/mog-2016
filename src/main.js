/* global myCanvas */
const { Turn } = require('./Turn.js')
const C = require('./constants.js')

myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight

const size = 50
const offsetFactor = 1
const edge = Math.min(window.innerWidth, window.innerHeight) / (size * offsetFactor)
const ctx = myCanvas.getContext('2d')

let matrix = Array(size).fill().map(() => Array(size).fill().map(() => 0))
matrix[0][0] = 1

let turn = new Turn(matrix
, [{
  i: 0,
  j: 0,
  dir: C.RIGHT,
  alive: true
}], [null])

const colors = ['black', 'blue']

function renderGame () {
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
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
  turn = turn.evolve()
  renderGame()
  console.log('step')
}, 100)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
}

document.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case KEY.S:
      turn.setInput(0, C.DOWN)
      break
    case KEY.W:
      turn.setInput(0, C.UP)
      break
    case KEY.A:
      turn.setInput(0, C.LEFT)
      break
    case KEY.D:
      turn.setInput(0, C.RIGHT)
      break
    default:
  }
})
