var levelup = require('levelup')
var leveldown = require('leveldown')

module.exports = function(dir, opts, cb) {
  opts.db = leveldown
  levelup(dir, opts, cb)
}
