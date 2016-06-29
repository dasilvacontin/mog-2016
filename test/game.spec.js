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

function boardHasCells (board, cells) {
  const cellsObj = {}
  cells.forEach(cell => { cellsObj[cell] = true })

  for (let i = 0; i < board.length; ++i) {
    const row = board[i]
    for (let j = 0; j < row.length; ++j) {
      const cell = row[j]
      delete cellsObj[cell]
    }
  }

  return Object.keys(cellsObj).length === 0
}

test('Game :: onPlayerJoin', (t) => {
  t.plan(17)
  t.timeoutAfter(100)

  const game = new Game()
  const { turn, players, sockets } = game
  const { board, bikes, inputs } = turn

  const socket = fakeSocket()
  socket.once('game:state', function (state) {
    t.ok(boardHasCells(board, [1]), 'should place players on the board')
    t.equal(bikes.length, 1, "should update turn's bikes")
    t.deepEqual(inputs, [null], "should update turn's inputs")
    t.deepEqual(players, {
      [socket.id]: 0
    }, 'should update (socketId => bikeId) hash')

    function stateUpdate (state) {
      const { turn, players } = state
      const { board, bikes, inputs } = turn

      t.ok(boardHasCells(board, [1, 2]), 'should place players on the board')
      t.equal(bikes.length, 2, "should update turn's bikes")
      t.deepEqual(inputs, [null, null], "should update turn's inputs")
      t.deepEqual(players, {
        [socket.id]: 0,
        [socket2.id]: 1
      }, 'should update (socketId => bikeId) hash')
    }

    const socket2 = fakeSocket()
    socket.once('game:state', stateUpdate)
    socket2.once('game:state', stateUpdate)

    game.onPlayerJoin(socket2)
    t.ok(boardHasCells(board, [1, 2]), 'should place players on the board')
    t.equal(bikes.length, 2, "should update turn's bikes")
    t.deepEqual(inputs, [null, null], "should update turn's inputs")
    t.deepEqual(players, {
      [socket.id]: 0,
      [socket2.id]: 1
    }, 'should update (socketId => bikeId) hash')
    t.deepEqual(
      sockets.map(socket => socket.id),
      [socket].map(socket => socket.id),
      'should store socket in sockets array')
  })

  game.onPlayerJoin(socket)
  t.ok(boardHasCells(board, [1]), 'player should be placed in the board')
  t.equal(bikes.length, 1, "should update turn's bikes")
  t.equal(inputs.length, 1, "should update turn's inputs")
  t.deepEqual(players, { [socket.id]: 0 }, 'should update (socketId => bikeId) hash')
  t.deepEqual(
    sockets.map(socket => socket.id),
    [socket].map(socket => socket.id),
    'should store socket in sockets array')
})

test('Game :: onChangeDir', (t) => {
  const game = new Game()
  const { inputs } = game.turn
  const socket = fakeSocket()
  const socket2 = fakeSocket()

  game.onPlayerJoin(socket)
  game.onPlayerJoin(socket2)

  game.onChangeDir(socket, C.DOWN)
  t.deepEqual(inputs, [C.DOWN, null], "onChangeDir should update current turn's input")

  game.onChangeDir(socket2, C.UP)
  t.deepEqual(inputs, [C.DOWN, C.UP], "onChangeDir should update current turn's input")
  t.end()
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
  const { turn, players, sockets } = game
  const { board, bikes, inputs } = turn

  const socket = fakeSocket()
  const socket2 = fakeSocket()

  game.onPlayerJoin(socket)
  game.onPlayerJoin(socket2)
  game.onChangeDir(socket, C.DOWN)
  game.onChangeDir(socket2, C.UP)

  game.onPlayerLeave(socket)
  t.deepEqual(players, { [socket2.id]: 1 }, 'should handle leaves for players hash')
  t.notOk(boardHasCells(board, [1]), 'should cleanup bike in board')
  t.ok(boardHasCells(board, [2]), 'the other bikes should still be there')
  t.equal(bikes[0], null, 'should free up the slot in the bikes array')
  t.equal(sockets[0], null, 'should free up the slot in the sockets array')
  t.deepEqual(inputs, [null, C.UP], 'should reset its input')
})
