const io = require('socket.io-client')
const socket = io('http://localhost:3000')

socket.on('connect', () => {
  socket.on('ok', () => console.log('all good'))
  socket.emit('changeDir', 3)
})
