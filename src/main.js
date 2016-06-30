/* global myCanvas */
const { Game } = require('./Game.js')
const C = require('./constants.js')

const socket = {
  id: 'asdf',
  emit: () => {}
}
const game = new Game()
game.onPlayerJoin(socket)

const edge = 50
myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

const colors = ['black', 'blue']

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
setInterval(function () {
  game.tick()
  renderGame()
  console.log('step')
}, 500)

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
}

document.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case KEY.S: game.onChangeDir(socket, C.DOWN)
  }
})
