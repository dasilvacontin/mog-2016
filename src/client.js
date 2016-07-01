/* global myCanvas, requestAnimationFrame */
const io = require('socket.io-client')
const { Game } = require('./Game.js')
const { Turn } = require('./Turn.js')
const C = require('./constants.js')

let debugTurn = null
const game = new Game()
const socket = io()

let sentPing
let ping = ''

function sendPing () {
  sentPing = Date.now()
  socket.emit('game:ping')
}
sendPing()

socket.on('game:pong', () => {
  ping = (Date.now() - sentPing) / 2
  console.log(ping)
  setTimeout(sendPing, 500)
})

socket.on('game:state', (state, turnIndex) => {
  // ignore game states unless they are for turn 0
  if (turnIndex !== 0) {
    debugTurn = state.turn
    return
  }

  const { board, bikes, inputs } = state.turn
  const turn = new Turn(board, bikes, inputs)

  game.turn = turn
  game.turns = [turn]
  game.players = state.players
  game.interval = state.interval
  game.lastTurn = Date.now() - ping
})

socket.on('changeDir', (socketId, dir, turnIndex) => {
  // don't apply your own input changes, may cause render flicker when
  // multiple input changes were sent in the same turn

  if (socketId === `/#${socket.id}`) return
  game.onChangeDir({ id: socketId }, dir, turnIndex)
})

const edge = 10
const offset = 1

myCanvas.width = window.innerWidth
myCanvas.height = window.innerHeight
const ctx = myCanvas.getContext('2d')

const colors = ['black', 'red', 'blue', 'cyan', 'purple', 'yellow', 'orange', 'green', 'pink', 'grey', 'teal', 'brown']

requestAnimationFrame(loop)
function loop () {
  requestAnimationFrame(loop)

  const now = Date.now()
  while (now - game.lastTurn >= game.interval) {
    game.tick()
    game.lastTurn += game.interval
  }

  const turn = game.turn
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const color = colors[cell]
      ctx.fillStyle = color
      ctx.fillRect(j * (edge + offset), i * (edge + offset), edge, edge)

      if (!debugTurn) continue
      const debugCell = debugTurn.board[i][j]
      const debugColor = colors[debugCell]
      ctx.fillStyle = debugColor
      ctx.fillRect(j * (edge + offset), i * (edge + offset), edge / 2, edge / 2)
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
  game.onChangeDir({ id: `/#${socket.id}` }, dir, turnIndex)
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
