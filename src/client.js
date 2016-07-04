const io = require('socket.io-client')
const { Game } = require('./Game.js')
const C = require('./constants.js')

const game = new Game({ size: 30 })
game.turns = []

const socket = io()
socket.on('game:state', (state, turnIndex) => {
  game.players = state.players
  game.turn = state.turn
  if (turnIndex < game.turns.length) game.turns = []
  game.turns[turnIndex] = state.turn
  prevTurn = turnIndex - 1
  let bikeId = game.players['/#' + socket.id] + 1
  if (bikeId) playerColor.style.backgroundColor = colors[bikeId].hex
  if (game.turn.bikes.length < 2) waitingPlayers.innerHTML = 'Waiting for players...'
  else waitingPlayers.innerHTML = ''
})

const myCanvas = document.getElementById('myCanvas')
const ctx = myCanvas.getContext('2d')

myCanvas.width = myCanvas.offsetWidth
myCanvas.height = myCanvas.offsetHeight
ctx.imageSmoothingEnabled = false
ctx.mozImageSmoothingEnabled = false

const colors = [C.BLACK, C.RED, C.BLUE, C.CYAN, C.PURPLE, C.YELLOW, C.ORANGE, C.GREEN, C.PINK, C.GREY, C.TEAL, C.BROWN]
const offset = 1
const edge = 14
const playerColor = document.getElementById('playerColor')
const waitingPlayers = document.getElementById('waitingForPlayers')
const trailH = document.getElementById('trailHorizontal')
const trailV = document.getElementById('trailVertical')
const trailCornerTl = document.getElementById('trailCornerTl')
const trailCornerTr = document.getElementById('trailCornerTr')
const trailCornerBl = document.getElementById('trailCornerBl')
const trailCornerBr = document.getElementById('trailCornerBr')

var trailBuffer = {}
var bikesBuffer = {}
var prevTurn = 0

window.requestAnimationFrame(renderGame)
function renderGame () {
  window.requestAnimationFrame(renderGame)
  const turn = game.turn
  if (prevTurn === 0) {
    trailBuffer = {}
    bikesBuffer = {}
    for (let i = 0; i < turn.board.length; ++i) {
      const row = turn.board[i]
      for (let j = 0; j < row.length; ++j) {
        const rect = makeRect(i, j)
        ctx.fillStyle = C.BLACK.hex
        ctx.fillRect(rect.i, rect.j, rect.w, rect.h)
      }
    }
  }
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const key = i + '_' + j
      const rect = makeRect(i, j)
      ctx.fillStyle = C.BLACK.hex
      ctx.fillRect(rect.i, rect.j, rect.w, rect.h)
      if (cell > C.EMPTY_CELL && prevTurn >= 0) {
        const bike = turn.bikes[cell - 1]
        bikesBuffer[cell] = { i: bike.i, j: bike.j }
        if (!trailBuffer[key]) {
          const dir = bike.dir
          const prevBike = game.turns[prevTurn].bikes[cell - 1]
          const prevDir = prevBike.dir
          const prevPos = { i: prevBike.j, j: prevBike.i }
          trailBuffer[key] = { bikeId: cell, dir: dir, prevDir: prevDir, i: prevPos.i, j: prevPos.j }
        }
      } else if (cell === C.EMPTY_CELL && trailBuffer[key]) {
        delete bikesBuffer[trailBuffer[key].bikeId]
        delete trailBuffer[key]
      }
    }
  }

  for (let key in trailBuffer) {
    drawTrail(trailBuffer[key])
  }

  for (let key in bikesBuffer) {
    const bike = bikesBuffer[key]
    const color = colors[key].hex
    const rect = makeRect(bike.i, bike.j)
    ctx.fillStyle = color
    ctx.fillRect(rect.i, rect.j, rect.w, rect.h)
  }
}

function drawTrail (trail) {
  let dir = trail.dir
  let prevDir = trail.prevDir
  let img = trailH
  var rect = makeRect(trail.j, trail.i)
  if (dir === prevDir) {
    if (dir === C.LEFT || dir === C.RIGHT) img = trailV
    else img = trailH
  } else {
    if ((dir === C.LEFT && prevDir === C.UP) || (dir === C.DOWN && prevDir === C.RIGHT)) img = trailCornerBl
    else if ((dir === C.RIGHT && prevDir === C.UP) || (dir === C.DOWN && prevDir === C.LEFT)) img = trailCornerBr
    else if ((dir === C.LEFT && prevDir === C.DOWN) || (dir === C.UP && prevDir === C.RIGHT)) img = trailCornerTl
    else img = trailCornerTr
  }
  drawImage(img, rect.i, rect.j, rect.w, rect.h, colors[trail.bikeId])
}

function drawImage (img, i, j, width, height, playerColor = C.WHITE) {
  ctx.drawImage(img, i, j, width, height)
  var data = ctx.getImageData(i, j, width, height)
  for (var k = 0; k < data.data.length; ++k) {
    var index = 4 * k
    var r = data.data[index]
    var g = data.data[index + 1]
    var b = data.data[index + 2]
    var a = data.data[index + 3]

    if (compareColor(r, g, b, a, C.MAGENTA)) {
      data.data[index] = playerColor.r // red
      data.data[index + 1] = playerColor.g // green
      data.data[index + 2] = playerColor.b // blue
      data.data[index + 3] = playerColor.a // alpha
    }
  }
  ctx.putImageData(data, i, j)
}

function compareColor (r, g, b, a, color) {
  return (r === color.r && g === color.g && b === color.b && a === color.a)
}

function makeRect (i, j) {
  return { i: j * (edge + offset), j: i * (edge + offset), w: edge, h: edge }
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

document.addEventListener('keydown', function (e) {
  const dir = DIR_FOR_KEY[e.keyCode]
  if (dir == null) return
  socket.emit('changeDir', dir, game.turns.length - 1)
})
