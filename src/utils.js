const C = require('../src/constants.js')
module.exports = {
  backwards: function backwards (dir1, dir2) {
    return (dir1 === C.UP && dir2 === C.DOWN) || (dir1 === C.DOWN && dir2 === C.UP) ||
    (dir1 === C.LEFT && dir2 === C.RIGHT) || (dir1 === C.RIGHT && dir2 === C.LEFT)
  }
}
