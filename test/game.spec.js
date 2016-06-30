const test = require('tape')
const EventEmitter = require('events')
const shortid = require('shortid')
const clone = require('clone')

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
  t.plan(22)
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
      [socket, socket2].map(socket => socket.id),
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

test('Game :: Player joins started game', (t) => {
  const game = new Game()
  const socket = fakeSocket()
  const socket2 = fakeSocket()

  game.onPlayerJoin(socket)
  game.onPlayerJoin(socket2)
  game.tick()

  const socket3 = fakeSocket()
  game.onPlayerJoin(socket3)
  t.notOk(boardHasCells(game.turn.board, [3]), 'if game has started, player shouldnt be placed on the board')
  t.equal(game.turn.bikes.length, 2, 'if game has started, a bike should not be created')
  t.equal(game.turn.inputs.length, 2, 'if game has started, player doesnt require an input')
  t.deepEqual(
    game.sockets.map(socket => socket.id),
    [socket, socket2, socket3].map(socket => socket.id),
    'should store socket in sockets array')

  t.end()
})

test('Game :: Player fills free slot in started game', (t) => {
  const game = new Game()
  const socket1 = fakeSocket()
  const socket2 = fakeSocket()
  const socket3 = fakeSocket()

  game.onPlayerJoin(socket1)
  game.onPlayerJoin(socket2)
  game.onPlayerJoin(socket3)
  game.tick()

  const { turn, players, sockets } = game
  const { board, bikes, inputs } = turn

  const oldBike = clone(bikes[1])
  game.onPlayerLeave(socket2)
  const socket4 = fakeSocket()
  game.onPlayerJoin(socket4)

  t.deepEqual(players, {
    [socket1.id]: 0,
    [socket4.id]: 1,
    [socket3.id]: 2
  }, 'should fill free slot in players')
  t.deepEqual(
    sockets.map(socket => socket && socket.id),
    [socket1.id, socket4.id, socket3.id],
    'should fill free slot in sockets')
  t.ok(boardHasCells(board, [1, 2, 3]),
    'bike from player who just left should still be there on the map')
  t.deepEqual(bikes[1], oldBike, 'bike shouldnt have been modified')
  t.ok(bikes[1].alive, 'bike should still be alive til next tick')
  t.deepEqual(inputs, [null, C.SELF_DESTRUCT, null], "joined bike shouldnt overwrite old bike's input")
  t.end()
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
  onPlayerLeave sets player's input to C.SELF_DESTRUCT, removes the player
  from the players hash, and frees up the slot in the sockets array.

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
  t.deepEqual(inputs, [C.SELF_DESTRUCT, C.UP],
    "should set bike's input to SELF_DESTRUCT action")
  t.deepEqual(players, { [socket2.id]: 1 }, 'should remove player from players hash')
  t.ok(boardHasCells(board, [1, 2]), 'bike should still be in board')
  t.notEqual(bikes[0], null, 'bike should still be in the bikes array')
  t.deepEqual(
    sockets.map(socket => socket && socket.id),
    [null, socket2.id],
    'should free up the slot in the sockets array')

  t.end()
})

test('Game :: tick', (t) => {
  const game = new Game()

  game.tick()
  t.equal(game.turns.length, 1, 'shouldnt start the game with < 2 players')

  const socket1 = fakeSocket()
  game.onPlayerJoin(socket1)
  game.tick()
  t.equal(game.turns.length, 1, 'shouldnt start the game with < 2 players')

  const socket2 = fakeSocket()
  game.onPlayerJoin(socket2)

  const oldTurn = game.turn
  game.tick()
  t.notEqual(game.turn, oldTurn, 'should update `this.turn` ref')
  t.equal(game.turns[1], game.turn, 'turn should be last turn in turns array')
  t.equal(game.turns.length, 2, 'should push new turn into turns array')

  game.turn.bikes.forEach(bike => { bike.alive = false })
  game.tick()
  t.equal(game.turns.length, 1, 'should reset turns array when game restarts')
  t.equal(game.turn.bikes.length, 2, 'there should be two bikes')
  t.ok(game.turn.bikes.every(bike => bike.alive), 'every bike should be alive')
  t.end()
})
