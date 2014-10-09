async = require 'async'
sanitize = require('validator').sanitize
store = require('./../adapters/redisStore.js').store
exports = module.exports
db = require './../adapters/db.js'

parse = (m) ->
	m.creationTime = parseInt m.creationTime
	m

exports.addMessage = (eid, uid, text, callback) ->
  #text = sanitize(msg.text).xss()
  q2 = 'INSERT INTO
  				messages (eid, uid, text, "creationTime")
  			VALUES
  				($1, $2, $3, $4)
  			returning *'
  db.query q2, [eid, uid, text, Date.now()], (err, result) ->
    return callback err if err?
    callback null, parse result.rows[0]

exports.getMoreMessages = (eid, mid, cb) ->
  q1 = 'SELECT
  				mid, eid, uid, text, "creationTime"::bigint
  			FROM
  				messages
  			WHERE
  				eid = $1 AND
  				mid >= $2
  			ORDER BY 
  				"creationTime"
  			LIMIT 10'
  db.query q1, [eid, mid], (err, results) ->
    return cb err if err?
    cb null, results.rows.map parse