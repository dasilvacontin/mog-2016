const io = require('socket.io-client')
const { Game } = require('./Game.js')
const C = require('./constants.js')

const game = new Game({ size: 30 })
game.turns = []
var prevTurn = 0

const socket = io()
socket.on('game:state', (state, turnIndex) => {
  game.players = state.players
  game.turn = state.turn
  if (turnIndex < game.turns.length) game.turns = []
  game.turns[turnIndex] = state.turn
  prevTurn = turnIndex - 1
})

const myCanvas = document.getElementById('myCanvas')
myCanvas.width = myCanvas.offsetWidth
myCanvas.height = myCanvas.offsetHeight
const ctx = myCanvas.getContext('2d')
const colors = [C.BLACK, C.RED, C.BLUE, 'cyan', 'purple', 'yellow', 'orange', 'green', 'pink', 'grey', 'teal', 'brown']
const offset = 1
const edge = Math.ceil((myCanvas.width / 34))
const trailH = document.getElementById('trailHorizontal')
const trailV = document.getElementById('trailVertical')
const trailCornerTl = document.getElementById('trailCornerTl')
const trailCornerTr = document.getElementById('trailCornerTr')
const trailCornerBl = document.getElementById('trailCornerBl')
const trailCornerBr = document.getElementById('trailCornerBr')
const trailBuffer = {}

window.requestAnimationFrame(renderGame)
function renderGame () {
  window.requestAnimationFrame(renderGame)
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height)
  const turn = game.turn
  for (let i = 0; i < turn.board.length; ++i) {
    const row = turn.board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      const key = i + '_' + j
      const bike = turn.bikes[cell - 1]
      if (cell > C.EMPTY_CELL && turn.bikes && bike) {
        if (!trailBuffer[key]) {
          const dir = bike.dir
          const prevBike = (prevTurn > 0) ? game.turns[prevTurn].bikes[cell - 1] : bike
          const prevDir = prevBike.dir
          const prevPos = { i: prevBike.j, j: prevBike.i }
          trailBuffer[key] = { bikeId: cell, dir: dir, prevDir: prevDir, i: prevPos.i, j: prevPos.j }
        }
      } else {
        if (trailBuffer[key]) delete trailBuffer[key]
        const color = colors[cell].hex
        ctx.fillStyle = color
        const rect = { i: j * (edge + offset), j: i * (edge + offset), w: edge - offset, h: edge - offset }
        ctx.fillRect(rect.i, rect.j, rect.w, rect.h)
      }
      if (trailBuffer[key]) drawTrail(trailBuffer[key])
    }
  }
}

function drawTrail (trail) {
  let dir = trail.dir
  let prevDir = trail.prevDir
  let img = trailH
  var rect = { i: trail.i * (edge + offset), j: trail.j * (edge + offset), w: edge - offset, h: edge - offset }
  if (dir === prevDir) {
    if (dir === C.LEFT || dir === C.RIGHT) {
      img = trailV
    } else {
      img = trailH
    }
  } else {
    if ((dir === C.LEFT && prevDir === C.UP) || (dir === C.DOWN && prevDir === C.RIGHT)) img = trailCornerBl
    else if ((dir === C.RIGHT && prevDir === C.UP) || (dir === C.DOWN && prevDir === C.LEFT)) img = trailCornerBr
    else if ((dir === C.LEFT && prevDir === C.DOWN) || (dir === C.UP && prevDir === C.RIGHT)) img = trailCornerTl
    else img = trailCornerTr
  }
  drawImage(img, rect.i, rect.j, rect.w, rect.h, colors[trail.bikeId])
}

function drawImage (img, i, j, width, height, playerColor = 'white') {
  ctx.drawImage(img, i, j, width, height)
  var data = ctx.getImageData(i, j, width, height)
  for (var k = 0; k < data.data.length; k++) {
    var index = 4 * k
    var a = data.data[index + 3]

    if (a !== 0) {
      data.data[index] = playerColor.r // red
      data.data[index + 1] = playerColor.g // green
      data.data[index + 2] = playerColor.b // blue
      data.data[index + 3] = 200 // alpha
    } else {
      data.data[index] = C.BLACK.r // red
      data.data[index + 1] = C.BLACK.g // green
      data.data[index + 2] = C.BLACK.b // blue
      data.data[index + 3] = C.BLACK.a // alpha
    }
  }
  ctx.putImageData(data, i, j)
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
