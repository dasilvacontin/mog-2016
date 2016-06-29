// server.js

const {Game} = require('../src/Game.js')

const server = require('http').createServer()
const io = require('socket.io')(server)
const PORT = 3000

var game = new Game()

function onChangeDir (dir) {
  game.onChangeDir(this, dir)
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

server.listen(PORT, () => console.log(`listening on ${PORT}`))

setInterval(function () {
  game.nextTurn()
  console.log('Step')
}, 10)
