const test = require('tape')
const EventEmitter = require('events')
const shortid = require('shortid')

const { Game } = require('../src/Game.js')
const C = require('../src/constants.js')

function fakeSocket () {
  const socket = new EventEmitter()
  socket.id = shortid()
  return socket
}

test('Game :: onPlayerConnected', (t) => {
  t.timeoutAfter(10)
  const game = new Game()
  const socket1 = fakeSocket()
  const socket2 = fakeSocket()

  let finished = 0
  function done () {
    finished++
    if (finished === 2) t.end()
  }

  socket1.once('game:state', function (state) {
    t.equal(state.turn.bikes.length, 1,
      'turn bikes should equal number of players')
    t.equal(state.players[socket1.id], 0,
      'map with player => bikeId should update')

    socket1.once('game:state', function (game) {
      t.equal(game.turn.bikes.length, 2,
        'turn bikes should equal number of players')
      t.equal(game.players[socket1.id], 0,
        'map with player => bikeId should update')
      t.equal(game.players[socket2.id], 1,
        'map with player => bikeId should update')
      done()
    })

    socket2.once('game:state', function (game) {
      t.equal(game.turn.bikes.length, 2,
        'turn bikes should equal number of players')
      t.equal(game.players[socket1.id], 0,
        'map with player => bikeId should update')
      t.equal(game.players[socket2.id], 1,
        'map with player => bikeId should update')
      done()
    })

    game.onPlayerConnected(socket2)
    t.equal(game.turn.bikes.length, 2,
      'turn bikes should equal number of players')
    t.equal(game.turn.inputs.length, 2,
      'turn inputs should equal number of players')
    t.equal(game.players[socket2.id], 1,
      'map with player => bikeId should update')
    t.equal(game.sockets[0], socket1,
      'should store socket in sockets array')
    t.equal(game.sockets[1], socket2,
      'should store socket in sockets array')
  })

  game.onPlayerConnected(socket1)
  t.equal(game.turn.bikes.length, 1,
    'turn bikes should equal number of players')
  t.equal(game.turn.inputs.length, 1,
    'turn inputs should equal number of players')
  t.equal(game.players[socket1.id], 0,
    'map with player => bikeId should update')
  t.equal(game.sockets[0], socket1,
    'should store socket in sockets array')
})

test('Game :: onChangeDir', (t) => {
  const game = new Game()
  const socket = fakeSocket()
  const socket2 = fakeSocket()

  game.onPlayerConnected(socket)
  game.onPlayerConnected(socket2)
  game.onChangeDir(socket, C.DOWN)
  t.deepEqual(game.turn.inputs, [C.DOWN, null],
    "onChangeDir should update current turn's input")
  game.onChangeDir(socket2, C.UP)
  t.deepEqual(game.turn.inputs, [C.DOWN, C.UP],
    "onChangeDir should update current turn's input")
  t.end()
})
