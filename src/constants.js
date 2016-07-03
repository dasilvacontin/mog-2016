module.exports = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,

  VECTOR_DIR: [
    { i: -1, j: 0 },
    { i: 1, j: 0 },
    { i: 0, j: -1 },
    { i: 0, j: 1 }],

  EMPTY_CELL: 0,
  SELF_DESTRUCT: -1,

  BLACK: {r: 255, g: 255, b: 255, a: 255, hex: 'black'},
  BLUE: {r: 0, g: 0, b: 255, a: 255, hex: 'blue'},
  RED: {r: 255, g: 0, b: 0, a: 255, hex: 'red'}
}
