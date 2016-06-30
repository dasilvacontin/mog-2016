// server.js
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {Game} = require('../src/Game.js')

app.use(express.static('dist'))
app.get('/', function (req, res) {
  res.sendfile('../dist/index.html')
})
// const server = require('http').createServer()
const PORT = process.env.PORT || 3000

var game = new Game()

function onChangeDir (dir, nTurn) {
  game.onChangeDir(this, dir, nTurn)
}

function onDisconnect () {
  game.onPlayerLeave(this)
}

io.on('connection', (socket) => {
  console.log(`a socket with id ${socket.id} connected`)
  game.onPlayerJoin(socket)
  socket.on('changeDir', onChangeDir)
  socket.on('disconnect', onDisconnect)
})

// server.listen(PORT, () => console.log(`listening on ${PORT}`))

http.listen(PORT, function () {
  console.log('listening on *:3000')
})

setInterval(function () {
  game.tick()
  // console.log('Step')
}, 50)
