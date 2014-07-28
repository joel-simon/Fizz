async = require 'async'
sanitize = require('validator').sanitize
store = require('./../adapters/redisStore.js').store
exports = module.exports
db = require './../adapters/db.js'
check = require('easy-types')
pg = require 'pg'

dbstring = db.connString;
rollback = (client, done) ->
  client.query 'ROLLBACK', (err) ->
    done err

exports.add = (user, description, callback) ->
  # check.is(user, 'user')
  # check.is(description, 'string')

  q1 = "INSERT INTO events
      (creator, description)
      VALUES ($1, $2)
      RETURNING eid, creation_time"

  q2 = "INSERT INTO invites (eid, uid, inviter, confirmed, accepted, accepted_time)
        VALUES ($1, $2, $3, $4, $5, $6)"

  eid = null
  creationTime = null
  now = Date.now()
  pg.connect dbstring, (err, client, done) ->
    return callback err if err
    async.waterfall [
      (cb) ->
        client.query 'BEGIN', cb
      () ->
        process.nextTick arguments[arguments.length-1]
      () ->
        client.query q1, [ user.uid, '{}'], arguments[arguments.length-1]
      (result, cb)->
        eid = result.rows[0].eid
        creationTime = result.rows[0].creation_time
        client.query q2, [eid, user.uid, user.uid, true, true, now], arguments[arguments.length-1]
    ], (err, results) ->
      if (err)
        rollback(client, done)
        callback(err)
      else
        client.query 'COMMIT', done
        callback null, {
          eid
          description
          creator: user.uid
          creationTime:now
        }

exports.delete = (eid, callback) ->
  q1 = "UPDATE events set death_time = $1 WHERE eid = $2"
  db.query q1, [Date.now(), eid], callback

# returns null on failure
exports.get = (eid, callback) ->
  eid = +eid
  q1 = "SELECT * FROM events WHERE events.eid = $1"
  db.query q1, [eid], (err, result) ->
    return callback err if err
    event = result.rows[0]
    event.creationTime =  event.creation_time
    delete event.creation_time
    callback null, event

exports.join = (eid, uid, callback) ->
  q1 = "UPDATE invites SET accepted = true, accepted_time = $1
        WHERE eid = $2 and uid = $3"
  q2 = "UPDATE events SET last_accepted_update = $1 where eid = $2"

  pg.connect dbstring, (err, client, done) ->
    return callback err if err
    async.series [
      (cb) -> client.query 'BEGIN', cb
      (cb) -> process.nextTick cb
      (cb) -> client.query q1, [ Date.now(), eid, uid ], cb
      (cb) -> client.query q2, [ Date.now(), eid ], cb
    ], (err, results) ->
      if err
        rollback client, done
        callback err
      else
        client.query 'COMMIT', done
        callback null

exports.leave = (eid, uid, callback) ->
  q1 = "UPDATE invites SET
        accepted = false,
        accepted_time = $1
        WHERE eid = $2 and uid = $3"
  q2 = "UPDATE events SET last_accepted_update = $1 where eid = $2"

  pg.connect dbstring, (err, client, done) ->
    return logError err if err;
    async.series [
      (cb) -> client.query 'BEGIN', cb
      (cb) -> process.nextTick cb
      (cb) -> client.query q1, [ Date.now(), eid, uid ], cb
      (cb) -> client.query q2, [ Date.now(), eid ], cb
    ], (err, results) ->
      if err
        rollback client, done
        callback err
      else
        client.query 'COMMIT', done
        callback null

exports.getGuestList = (eid, callback) ->
  q1 = "SELECT array_agg(uid) FROM invites WHERE eid = $1 and accepted = true"
  db.query q1, [eid], (err, result) ->
    return callback err if err?
    callback null, result.rows[0]['array_agg']

exports.getInviteList = (eid, cb) ->
  q = "SELECT users.uid, pn, name, accepted FROM users, invites WHERE invites.eid = $1 and users.uid = invites.uid"
  db.query q, [eid], (err, result) ->
    if err?
      cb err 
    else
      cb null, result.rows

exports.addInvites = (eid, inviter, users, confirmed, cb) ->
  q = "insert into invites (eid, uid, inviter, confirmed, invited_time, accepted_time) values "
  values = []
  now = Date.now()
  for u in users
    values=values.concat '('+([eid,u.uid,inviter,confirmed, now, now].join(','))+')'

  db.query q+(values.join(',')),[], cb



