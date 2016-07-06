const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { Game } = require('./Game.js')

const game = new Game({ size: 30 })
setInterval(game.tick.bind(game), 150)

app.use(express.static('dist'))
app.get('/', function (req, res) {
  res.sendfile('../dist/index.html')
})

app.get('/test', function (req, res) {
  res.send('testerino')
})

io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)
  game.onPlayerJoin(socket)

  socket.on('changeDir', function (dir) {
    game.onChangeDir(socket, dir)
  })

  socket.on('disconnect', function () {
    game.onPlayerLeave(socket)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`)
})
