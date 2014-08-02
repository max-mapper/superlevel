var levelup = require('levelup')
var leveldown = require('leveldown-prebuilt')

module.exports = function(dir, cb) {
  levelup(dir, {db: leveldown}, cb)
}
