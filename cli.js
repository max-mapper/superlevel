#!/usr/bin/env node

var load = require('./')
var args = require('minimist')(process.argv.slice(2))
var path = require('path')
var through = require('through2')

if (args._.length === 0) {
  console.error("Usage: superlevel <path-to-leveldb> <command> <key> <value> --option")
  process.exit(1)
}

var dir = path.resolve(process.cwd(), args._[0])

if (Object.keys(args).indexOf('createIfMissing') === -1) args.createIfMissing = false
  
load(dir, args, function(err, db) {
  if (err) throw err
  var op = args._[1]
  var key = args._[2]
  var val = args._[3]
  var cmd
  if (val) cmd = db[op](key, val, args, log)
  else if (key) cmd = db[op](key, args, log)
  else cmd = db[op](args, log)
  if (cmd && cmd.readable) cmd.pipe(logStream())
})

function log(err, result) {
  if (err) return console.error(err)
  if (result) console.log(result)
}

function logStream() {
  return through.obj(function (obj, enc, next) {
    console.log(JSON.stringify(obj))
    next()
  })
}
