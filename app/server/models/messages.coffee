async = require 'async'
sanitize = require('validator').sanitize
store = require('./../adapters/redisStore.js').store
exports = module.exports
db = require './../adapters/db.js'

exports.addMessage = (eid, uid, text, callback) ->
  #text = sanitize(msg.text).xss()
  q2 = "INSERT INTO messages (eid, uid, text, creation_time) VALUES ($1, $2, $3, $4) returning *"
  db.query q2, [eid, uid, text, Date.now()], (err, result) ->
    return callback err if err?
    return callback null, result.rows[0]

exports.getMoreMessages = (eid, mid, cb) ->
  q1 = "SELECT * FROM messages WHERE eid = $1 and mid > $2 ORDER BY creation_time LIMIT 10"
  db.query q1, [eid, mid], (err, results) ->
    return cb err if err?
    cb null, results.rows