const test = require('tape')
const { Turn } = require('../src/Turn.js')
const C = require('../src/constants.js')

test('Turn', (t) => {
  const board = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 2]
  ]
  const bikes = [{ i: 1, j: 0, dir: C.RIGHT }, { i: 2, j: 2, dir: C.LEFT }]
  const inputs = [null, null]
  const turn = new Turn(board, bikes, inputs)

  // turn.setInput(playerIndex, direction)
  turn.setInput(0, C.DOWN)
  turn.setInput(0, C.UP)
  t.equal(turn.inputs[0], C.UP, 'setInput should update turns input')

  const nextTurn = turn.evolve()
  t.deepEqual(turn.inputs, [C.UP, null], 'evolve shouldnt consume/erase the inputs')
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
    { i: 0, j: 0, dir: C.UP },
    { i: 2, j: 1, dir: C.lEFT }
  ], 'bike position and direction should update')
  t.deepEqual(nextTurn.inputs, [null, null], 'a new turns inputs should be null')
  t.end()
})

// const alivePlayers = players.filter(player => player.isAlive())
