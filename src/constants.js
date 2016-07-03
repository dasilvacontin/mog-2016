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

  WHITE: {r: 241, g: 241, b: 241, a: 255, hex: '#f1f1f1'},
  BLACK: {r: 35, g: 35, b: 37, a: 255, hex: '#232325'},
  MAGENTA: {r: 255, g: 0, b: 255, a: 255, hex: 'magenta'},

  BLUE: {r: 128, g: 166, b: 255, a: 255, hex: '#80a6ff'},
  RED: {r: 255, g: 128, b: 128, a: 255, hex: '#ff8080'},
  CYAN: {r: 128, g: 255, b: 234, a: 255, hex: '#80ffea'},
  PURPLE: {r: 159, g: 128, b: 255, a: 255, hex: '#9f80ff'},
  YELLOW: {r: 253, g: 253, b: 150, a: 255, hex: '#fdfd96'},
  ORANGE: {r: 255, g: 195, b: 128, a: 255, hex: '#ffc380'},
  GREEN: {r: 202, g: 255, b: 128, a: 255, hex: '#caff80'},
  PINK: {r: 100, g: 82, b: 86, a: 255, hex: '#ffd1dc'},
  GREY: {r: 83, g: 83, b: 83, a: 255, hex: '#d3d3d3'},
  TEAL: {r: 56, g: 142, b: 142, a: 255, hex: '#388E8E'},
  BROWN: {r: 152, g: 118, b: 84, a: 255, hex: '#987654'}
}
