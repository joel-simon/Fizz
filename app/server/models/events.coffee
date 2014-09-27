async = require 'async'
sanitize = require('validator').sanitize
store = require('./../adapters/redisStore.js').store
exports = module.exports
models = require '../models'
db = require './../adapters/db.js'
pg = require 'pg'
_ = require 'underscore'
dbstring = db.connString;

exports.parse = (data) ->
  try
    eid:           parseInt(data.eid),
    creator:       data.creator
    description:   data.description
    key:           data.key
    creationTime:  parseInt(data.creationTime)
    deathTime:     parseInt(data.deathTime)
    lastUpdateTime:parseInt(data.lastAcceptedUpdate)
  catch
    null

exports.update = (eid, callback) ->
  q1 = 'UPDATE events set "lastAcceptedUpdate" = $1 WHERE eid = $2'
  db.query q1, [Date.now(), eid], callback

exports.add = (user, description, callback) ->
  q1 = 'INSERT INTO events
      (creator, description, key)
      VALUES ($1, $2, $3)
      RETURNING eid, "creationTime"'
  db.query q1, [ user.uid, description, randString(5)], (err, results) ->
    return callback err if err?
    {rows} = results
    eid = rows[0].eid
    callback null, exports.parse {
      eid
      description
      creator: user.uid
      creation_time : Date.now()
    }

exports.delete = (eid, callback) ->
  q1 = 'UPDATE events set "deathTime" = $1 WHERE eid = $2'
  db.query q1, [Date.now(), eid], callback

exports.updateDescription = (eid, description, callback) ->
  q1 = 'UPDATE events set description = $2 WHERE eid = $1'
  db.query q1, [eid, description], callback

exports.get = (eid, callback) ->
  q1 = "SELECT * FROM events WHERE eid = $1"
  db.query q1, [eid], (err, result) ->
    return callback err if err
    callback null, exports.parse result.rows[0]

exports.getFullFromKey = (key, callback) ->
  q1 = "SELECT eid FROM events WHERE key = $1"
  db.query q1, [key], (err, result) ->
    return callback err if err
    return callback null, null if not result.rows[0]?
    eid = result.rows[0].eid
    exports.getFull eid, callback

exports.getGuestList = (eid, callback) ->
  q1 = "SELECT array_agg(uid) FROM invites WHERE eid = $1 and accepted = true"
  db.query q1, [eid], (err, result) ->
    return callback err if err?
    callback null, result.rows[0]['array_agg']

exports.getInviteList = (eid, callback) ->
  q = "SELECT users.uid, pn, name, accepted, platform FROM users, invites WHERE invites.eid = $1 and users.uid = invites.uid"
  db.query q, [eid], (err, result) ->
    return callback err if err?
    callback null, result.rows

exports.getFull = (eid, callback) ->
  messages = require './messages'
  async.series {
    event   : (cb) -> exports.get eid, cb
    messages: (cb) -> messages.getMoreMessages eid, 0, cb
    invited : (cb) -> exports.getInviteList eid, cb
    guests  : (cb) -> exports.getGuestList eid, cb
  }, (err, result) ->
    return callback err if err?
    callback null, result.event, result.messages, result.invited, result.guests

randString = (n) ->
  text = ""
  possible = "abcdefghijklmnopqrstuvwxyz0123456789"
  for i in [0..n]
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  text