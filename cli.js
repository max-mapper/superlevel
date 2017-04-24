#!/usr/bin/env node

var load = require('./')
var args = require('minimist')(process.argv.slice(2))
var path = require('path')
var through = require('through2')
var ndjson = require('ndjson')
var streamEach = require('stream-each')

if (args._.length === 0) {
  console.error('Usage: superlevel <path-to-leveldb> <command> <key> <value> --option')
  process.exit(1)
}

var dir = path.resolve(process.cwd(), args._[0])

if (Object.keys(args).indexOf('createIfMissing') === -1) args.createIfMissing = false

load(dir, args, function (err, db) {
  if (err) throw err
  var op = args._[1]
  var key = args._[2]
  var val = args._[3]

  if (op === 'createWriteStream') return writeStream(db).pipe(logStream())
  if (op === 'createGetStream') return getStream(db).pipe(logStream())

  var cmd
  if (val) cmd = db[op](key, val, args, log)
  else if (key) cmd = db[op](key, args, log)
  else cmd = db[op](args, log)
  if (cmd && cmd.readable) cmd.pipe(logStream())
})

function log (err, result) {
  if (err) return console.error(JSON.stringify({error: err.message}))
  if (result) console.log(JSON.stringify(result))
}

function logStream () {
  return through.obj(function (obj, enc, next) {
    console.log(JSON.stringify(obj))
    next()
  })
}

function writeStream (db) {
  var results = through.obj()
  var input = process.stdin.pipe(ndjson.parse())
  streamEach(input, function (data, next) {
    if (!data.key || !data.value) return next(new Error('Must specify key and value properties'))
    db.put(data.key, data.value, function (err) {
      if (err) return next(err)
      results.write({success: true, key: data.key})
      next()
    })
  }, function (err) {
    if (err) {
      console.error(JSON.stringify({success: false, error: err.message}))
      results.end()
      process.exit(1)
    }
  })
  return results
}

function getStream (db) {
  var results = through.obj()
  var input = process.stdin.pipe(ndjson.parse())
  streamEach(input, function (data, next) {
    if (!data) return next(new Error('Must specify key'))
    db.get(data, function (err, val) {
      if (err) {
        if (err.notFound) {
          results.write({key: data})
          next()
          return
        }
        return next(err)
      }
      results.write({key: data, value: val})
      next()
    })
  }, function (err) {
    if (err) {
      console.error(JSON.stringify({success: false, error: err.message}))
      results.end()
      process.exit(1)
    }
  })
  return results
}
