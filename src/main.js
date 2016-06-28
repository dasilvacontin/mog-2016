/* global myCanvas */
const { Turn } = require('./Turn.js')
const C = require('./constants.js')

const edge = 10
const offset = 2
myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

var board = []
for (let i = 0; i < 30; ++i) {
  var a = []
  for (let j = 0; j < 30; ++j) {
    a.push(0)
  }

  board.push(a)
}

let turn = new Turn(board,
[{ i: 0, j: 0, dir: C.RIGHT, alive: true },
{ i: 3, j: 3, dir: C.LEFT, alive: true }], [null, null])

const colors = ['black', 'blue', 'red']

function renderGame () {
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const color = colors[cell]
      ctx.fillStyle = color
      ctx.fillRect(j * (edge + offset), i * (edge + offset), edge, edge)
    }
  }
}

renderGame()
setInterval(function () {
  turn = turn.evolve()
  renderGame()
  console.log('step')
}, 300)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
}

document.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case KEY.S: turn.setInput(0, C.DOWN); break
    case KEY.W: turn.setInput(0, C.UP); break
    case KEY.D: turn.setInput(0, C.RIGHT); break
    case KEY.A: turn.setInput(0, C.LEFT); break
    case KEY.DOWN: turn.setInput(1, C.DOWN); break
    case KEY.UP: turn.setInput(1, C.UP); break
    case KEY.RIGHT: turn.setInput(1, C.RIGHT); break
    case KEY.LEFT: turn.setInput(1, C.LEFT); break
  }
})
