# superlevel

a minimalist cli utility for leveldb databases

[![NPM](https://nodei.co/npm/superlevel.png?global=true)](https://nodei.co/npm/superlevel/)

if you want more features check out [lev](https://www.npmjs.org/package/lev)

## usage

```
$ superlevel <path-to-leveldb> <command> <key> <value> --option
```

most arguments are applied directly to a [levelup](https://github.com/rvagg/node-levelup#api) instance

## examples

```
$ superlevel db put foo baz --createIfMissing=true # if the db doesnt exist yet
$ superlevel db/ get foo
baz
$ superlevel db/ put foo baz
$ superlevel db/ get foo
bar
$ superlevel db/ put zoo cow
$ superlevel db/ createReadStream
{"key":"foo","value":"bar"}
{"key":"zoo","value":"cow"}
$ superlevel db/ createReadStream --start=z
{"key":"zoo","value":"cow"}
$ superlevel db/ delete foo
$ superlevel db/ createReadStream
{"key":"zoo","value":"cow"}
```

### streaming many gets and puts

```
$ cat cooldata.json | superlevel db/ createWriteStream
{"success":true,"key":"pizza"}
{"success":true,"key":"musubi"}
$ cat cooldata.json | jsonfilter key | superlevel db/ createGetStream
{"key":"pizza","value":"pineapple"}
{"key":"musubi","value":"spam"}
```
