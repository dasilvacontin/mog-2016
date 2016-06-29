/* const server = require('http').createServer()
const io = require('socket.io')(server)
const PORT = 3000
var string = 'none'

function onChangeDir (dir) {
  const socket = this
  console.log(dir)
  socket.emit('ok')
}

io.on('connection', (socket) => {
  console.log(`a socket with id ${socket.id} connected`)
  socket.on('changeDir', onChangeDir)
  socket.on('string', onChangeString)
})

server.listen(PORT, () => console.log(`listening on ${PORT}`))

function onChangeString (string) {
  console.log(string)
}

setInterval(
  function () {
    console.log(string)
  }, 250
)
*/
