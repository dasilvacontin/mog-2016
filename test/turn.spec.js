const test = require('tape')
const { Turn } = require('../src/Turn.js')
const C = require('../src/constants.js')

test('Turn :: Basics', (t) => {
  const board = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 2]
  ]
  const boardCopy = board.map(row => row.slice())
  const bikes = [
    { i: 1, j: 0, dir: C.RIGHT, alive: true },
    { i: 2, j: 2, dir: C.LEFT, alive: true }
  ]
  const bikesCopy = Object.assign({}, bikes)
  const inputs = [null, null]
  const turn = new Turn(board, bikes, inputs)

  // turn.setInput(playerIndex, direction)
  turn.setInput(0, C.DOWN)
  turn.setInput(0, C.UP)
  t.equal(turn.inputs[0], C.UP, 'setInput should update turns input')

  const nextTurn = turn.evolve()
  t.deepEqual(turn.board, boardCopy, 'evolve shouldnt modify the board')
  t.deepEqual(turn.bikes, bikesCopy, 'evolve shouldnt modify the bikes')
  t.deepEqual(turn.inputs, [C.UP, null], 'evolve shouldnt modify the inputs')
  turn.setInput(1, C.UP) // shouldnt affect the already evolved turn

  t.ok(nextTurn instanceof Turn, 'evolve should return an instance of Turn')
  t.notEqual(turn, nextTurn, 'evolve should return a new instance of Turn')
  t.notEqual(turn.board, nextTurn.board, 'turns shouldnt share boards')
  t.notEqual(turn.bikes, nextTurn.bikes, 'turns shouldnt share bikes')
  t.notEqual(turn.inputs, nextTurn.inputs, 'turns shouldnt share inputs')

  t.deepEqual(nextTurn.board, [
    [1, 0, 0],
    [1, 0, 0],
    [0, 2, 2]
  ], 'bikes should move on the board')
  t.deepEqual(nextTurn.bikes, [
    { i: 0, j: 0, dir: C.UP, alive: true },
    { i: 2, j: 1, dir: C.LEFT, alive: true }
  ], 'bike position and direction should update')
  t.deepEqual(nextTurn.inputs, [null, null], 'a new turns inputs should be null')
  t.end()
})

test('Turn :: Directions', (t) => {
  const board = [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const bikes = [
    { i: 0, j: 1, dir: C.DOWN, alive: true }
  ]
  const inputs = [C.UP]
  const turn = new Turn(board, bikes, inputs)
  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0]
  ], 'ignore input that make bikes turn around')
  t.deepEqual(nextTurn.bikes, [
    { i: 1, j: 1, dir: C.DOWN, alive: true }
  ], 'ignore input that make bikes turn around')
  t.end()
})

test('Turn :: Advanced', (t) => {
  const board = [
    [1, 2, 2],
    [0, 0, 5],
    [4, 0, 3]
  ]
  const bikes = [
    { i: 0, j: 0, dir: C.UP, alive: true },
    { i: 0, j: 2, dir: C.RIGHT, alive: true },
    { i: 2, j: 2, dir: C.LEFT, alive: true },
    { i: 2, j: 0, dir: C.RIGHT, alive: true },
    { i: 1, j: 2, dir: C.UP, alive: true }
  ]
  const inputs = [null, C.LEFT, null, null, null]
  const turn = new Turn(board, bikes, inputs)

  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ])
  t.deepEqual(nextTurn.bikes, [
    { i: -1, j: 0, dir: C.UP, alive: false },
    { i: 0, j: 3, dir: C.RIGHT, alive: false },
    { i: 2, j: 1, dir: C.LEFT, alive: false },
    { i: 2, j: 1, dir: C.RIGHT, alive: false },
    { i: 0, j: 2, dir: C.UP, alive: false }
  ])
  t.end()
})

test('Turn :: Dont move dead bikes', (t) => {
  const board = [
    [0, 2, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const bikes = [
    { i: 1, j: 1, dir: C.DOWN, alive: false },
    { i: 0, j: 1, dir: C.DOWN, alive: true },
    { i: 1, j: 1, dir: C.LEFT, alive: false }
  ]
  const inputs = [null, null, C.RIGHT]
  const turn = new Turn(board, bikes, inputs)
  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [0, 2, 0],
    [0, 2, 0],
    [0, 0, 0]
  ], 'evolve shouldnt modify/use dead bikes')
  t.deepEqual(nextTurn.bikes[2], { i: 1, j: 1, dir: C.LEFT, alive: false },
    'broken bikes shouldnt change direction')
  t.end()
})

test('Turn :: Multicollision', (t) => {
  const board = [
    [0, 1, 0],
    [4, 0, 2],
    [0, 3, 0]
  ]
  const bikes = [
    { i: 0, j: 1, dir: C.DOWN, alive: true },
    { i: 1, j: 2, dir: C.LEFT, alive: true },
    { i: 2, j: 1, dir: C.UP, alive: true },
    { i: 1, j: 0, dir: C.RIGHT, alive: true }
  ]
  const inputs = [null, null, null, null]
  const turn = new Turn(board, bikes, inputs)
  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ])
  t.end()
})

test('Turn :: Dying with a tron that is dying at the same turn', (t) => {
  const board = [
    [1, 1, 1],
    [2, 0, 1],
    [2, 2, 2]
  ]
  const bikes = [
    { i: 1, j: 2, dir: C.DOWN, alive: true },
    { i: 1, j: 0, dir: C.UP, alive: true }
  ]
  const inputs = [null, null]
  const turn = new Turn(board, bikes, inputs)
  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ], 'the bikes should die together')
  t.deepEqual(nextTurn.bikes, [
    { i: 2, j: 2, dir: C.DOWN, alive: false },
    { i: 0, j: 0, dir: C.UP, alive: false }
  ])
  t.end()
})

test('Turn :: Not cutting other bikes', (t) => {
  const board = [
    [1, 1, 1],
    [2, 2, 1],
    [0, 1, 1]
  ]
  const bikes = [
    { i: 2, j: 1, dir: C.LEFT, alive: true },
    { i: 1, j: 1, dir: C.RIGHT, alive: true }
  ]
  const inputs = [null, null]
  const turn = new Turn(board, bikes, inputs)

  const nextTurn = turn.evolve()
  t.deepEqual(nextTurn.board, [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1]
  ], 'the dead bike should not override the alive bike')
  t.deepEqual(nextTurn.bikes, [
    { i: 2, j: 0, dir: C.LEFT, alive: true },
    { i: 1, j: 2, dir: C.RIGHT, alive: false }
  ])
  t.end()
})

/*
  Player's input is C.SELF_DESTRUCT when the player disconnects.
  It causes the bike to break down.
 */
test('Turn :: Self-Destruct', (t) => {
  const board = [
    [0, 0, 0],
    [1, 1, 0],
    [0, 0, 0]
  ]
  const bikes = [{ i: 1, j: 1, dir: C.RIGHT, alive: true }]
  const inputs = [null]
  const turn = new Turn(board, bikes, inputs)

  turn.setInput(0, C.SELF_DESTRUCT)
  t.equal(turn.bikes[0].alive, true, 'bike shouldnt self-destruct til turn evolves')
  const nextTurn = turn.evolve()
  t.equal(nextTurn.bikes[0].alive, false, 'the bike should break down')
  t.deepEqual(nextTurn.board, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ], 'the bike and its trail should be cleaned up from the board')
  t.deepEqual(nextTurn.inputs, [null], 'inputs should be reset as always')
  t.end()
})

test('Turn :: dirForPos', (t) => {
  const turn = new Turn([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ])
  t.equal(turn.dirForPos(0, 1), C.DOWN)
  t.equal(turn.dirForPos(1, 0), C.RIGHT)
  t.equal(turn.dirForPos(1, 2), C.LEFT)
  t.equal(turn.dirForPos(2, 1), C.UP)
  t.end()
})
// const alivePlayers = players.filter(player => player.isAlive())
