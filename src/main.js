'use strict'
/* global myCanvas */
const { Turn } = require('./Turn.js')
const C = require('./constants.js')

const edge = 10
myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')
const size = 30

let myLevMatrix = new Array(size)
for (let x = 0; x < size; x++) {
  myLevMatrix[x] = new Array(size)
  for (let y = 0; y < size; y++) myLevMatrix[x][y] = 0
}
myLevMatrix[0][0] = 1
let turn = new Turn(myLevMatrix, [{
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
      ctx.fillRect(j * (edge + 5), i * (edge + 5), edge, edge)
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
  D: 68
}

document.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case KEY.S: turn.setInput(0, C.DOWN)
      break
    case KEY.A: turn.setInput(0, C.LEFT)
      break
    case KEY.W: turn.setInput(0, C.UP)
      break
    case KEY.D: turn.setInput(0, C.RIGHT)
  }
})
