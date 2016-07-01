/* global myCanvas, requestAnimationFrame */
const io = require('socket.io-client')
const { Game } = require('./Game.js')
const C = require('./constants.js')

const game = new Game()
game.turns = []
const socket = io()
socket.on('game:state', (state, turnIndex) => {
  game.players = state.players
  game.turn = state.turn
  if (turnIndex < game.turns.length) game.turns = []
  game.turns[turnIndex] = state.turn
})

const edge = 10
const offset = 1

myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

const colors = ['black', 'red', 'blue', 'cyan', 'purple', 'yellow', 'orange', 'green', 'pink', 'grey', 'teal', 'brown']

requestAnimationFrame(renderGame)
function renderGame () {
  requestAnimationFrame(renderGame)

  const turn = game.turn
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

const ENTER = 13
const chatInput = document.getElementById('chatInput')
document.addEventListener('keydown', function (e) {
  if (e.keyCode === ENTER) return sendMessage()

  const dir = DIR_FOR_KEY[e.keyCode]
  if (dir == null) return
  const turnIndex = game.turns.length - 1
  socket.emit('changeDir', dir, turnIndex)
})

/*
 * const chatSocket = io()
 * chatSocket.on('chatMessage', (message) => {
 *
 * })
 *
 * socket.id
 * #/iuoasdufhna8s3286
 */

function sendMessage () {
  let content = chatInput.value.trim()
  chatInput.value = ''
  if (content.length === 0) return

  console.log('input', chatInput.value)
  socket.emit('chatMessage', content)

  const messageDOM = document.createElement('p')
  messageDOM.innerHTML = `Anon: ${content}`
  chatContainer.appendChild(messageDOM)
}
global.sendMessage = sendMessage

// chat
const chatContainer = document.getElementById('chatContainer')
console.log(chatContainer)
