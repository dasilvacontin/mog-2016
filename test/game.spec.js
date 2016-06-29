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
  const game = new Game()
  const socket1 = fakeSocket()
  const socket2 = fakeSocket()

  let finished = 0
  function done () {
    finished++
    if (finished === 3) t.end()
  }

  game.onPlayerConnected(socket1)
  t.equal(game.turn.bikes.length, 1,
    'turn bikes should equal number of players')
  t.equal(game.turn.inputs.length, 1,
    'turn inputs should equal number of players')
  t.equal(game.players[socket1.id], 0,
    'map with player => bikeId should update')

  socket1.once('game:state', function (game) {
    t.equal(game.turn.bikes.length, 1,
      'turn bikes should equal number of players')
    t.equal(game.players[socket1.id], 0,
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
})

test('Game :: onChangeDir', (t) => {
  const game = new Game()
  const socket = fakeSocket()

  game.onPlayerConnected(socket)
  game.onChangeDir(socket, C.DOWN)
  t.deepEqual(game.turn.inputs, [C.DOWN],
    "onChangeDir should update current turn's input")
  t.end()
})
