pg = require 'pg'
config = require './../config'
dbstring = config.DB.POSTGRES_UR

utils   = require './../utilities.js'
log     = utils.log
logError = utils.logError

pg.connect dbstring, (err, client, done) ->
  if !client
    logError 'No Connection to Postgresql'
    throw 'No Connection to Postgresql'

rollback = (client, done) ->
  client.query 'ROLLBACK', (err) ->
    return done(err);

String.prototype.insert = (index, string) ->
  if index > 0
   this.substring(0, index) + string + this.substring(index, this.length)
  else
    string + this

exports.query = (text, values, cb) ->
  if !cb
    cb = values
    values = []

  if typeof(text) != 'string'
    return cb "Invalid db.query params. text:#{text}"
  if not Array.isArray values
    return cb "Invalid db.query params. values:#{values}"
  if typeof(cb) != 'function'
    return cb "Invalid db.query params. cb:#{cb}"
  
  pg.connect dbstring, (err, client, done) ->
    return cb err if err?
    client.query text, values, (err, result) ->
      done()
      if err
        err.text = text.insert err.position-1, '->'
      cb err, result

exports.transaction = (main, cb) ->
  pg.connect dbstring, (err, client, done) ->
    return cb err if err?
    client.query 'BEGIN', (err) ->
      return cb err if err?
      process.nextTick () ->
        main (err, results) ->
          if  err?
            rollback client, done
            cb err
          else
            client.query 'COMMIT', done
            cb null