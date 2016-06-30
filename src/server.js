const server = require('http').createServer()
const io = require('socket.io')(server)
const PORT = 3000

function onChangeDir (dir) {
  const socket = this
  console.log(dir)
  socket.emit('ok')
}

io.on('connection', (socket) => {
  console.log(`a socket with id ${socket.id} connected`)
  socket.on('changeDir', onChangeDir)
})

server.listen(PORT, () => console.log(`listening on ${PORT}`))
