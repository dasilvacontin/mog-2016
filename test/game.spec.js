const test = require('tape')
const EventEmitter = require('events')
const shortid = require('shortid')

const { Game } = require('../src/Game.js')
const C = require('../src/constants.js')

function fakeSocket () {
  const socket = new EventEmitter()
  socket.id = shortid()

  const _emit = socket.emit
  socket.emit = function () {
    const args = arguments
    setTimeout(function () {
      _emit.apply(socket, args)
    }, 1)
  }

  return socket
}

test('Game :: onPlayerJoin', (t) => {
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

    game.onPlayerJoin(socket2)
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

  game.onPlayerJoin(socket1)
  t.equal(game.turn.bikes.length, 1,
    'turn bikes should equal number of players')
  t.equal(game.turn.inputs.length, 1,
    'turn inputs should equal number of players')
  t.equal(game.players[socket1.id], 0,
    'map with player => bikeId should update')
  t.equal(game.sockets[0], socket1,
    'should store socket in sockets array')
})

/*
  hint:
  you can delete object properties doing
  delete obj.a
  delete obj['a']

  eg
  delete this.players[socket.id]
*/
test('Game :: onPlayerLeave', (t) => {
  const game = new Game()
  const socket1 = fakeSocket()
  const socket2 = fakeSocket()
  const socket3 = fakeSocket()

  game.onPlayerJoin(socket1)
  game.onPlayerJoin(socket2)
  game.onPlayerLeave(socket1)
  game.onPlayerJoin(socket3)
  t.deepEqual(game.players, {
    [socket2.id]: 1,
    [socket3.id]: 0
  }, 'players hash should handle leaves correctly')
  t.equal(game.sockets.length, 2)
  t.equal(game.sockets[0], socket3)
  t.equal(game.sockets[1], socket2)
})

test('Game :: onChangeDir', (t) => {
  const game = new Game()
  const socket = fakeSocket()
  const socket2 = fakeSocket()

  game.onPlayerJoin(socket)
  game.onPlayerJoin(socket2)
  game.onChangeDir(socket, C.DOWN)
  t.deepEqual(game.turn.inputs, [C.DOWN, null],
    "onChangeDir should update current turn's input")
  game.onChangeDir(socket2, C.UP)
  t.deepEqual(game.turn.inputs, [C.DOWN, C.UP],
    "onChangeDir should update current turn's input")
  t.end()
})
