utils   = require './../utilities.js'
async   = require 'async'
db = require './../adapters/db.js'
_  = require 'underscore'

module.exports =
  get : ({ key }, callback) ->
    q = 'select eid, uid, inviter, accepted from invites where key = $1 limit 1'
    db.query q, [key], (err, results) ->
      return callback err if err?
      callback null, results.rows[0] || {}

  add : ({ eid, uid, inviter, accepted }, callback) ->
    key = randString 16
    accepted ?= false
    acceptedTime = if accepted then Date.now() else null
    q = 'INSERT INTO invites
          (eid, uid, inviter, accepted, key, "acceptedTime")
        SELECT $1, $2, $3, $4, $5, $6
        WHERE
          NOT EXISTS (
            SELECT 1 FROM invites WHERE eid = $1 AND uid = $2
          )'
    params = [eid, uid, inviter, accepted, key, acceptedTime]
    db.query q, params, (err, result) ->
      return callback err if err?
      callback null, { eid, uid, inviter, accepted, key }
  
  accept: ({ eid, uid }, callback) ->
    now = Date.now()
    q = 'UPDATE invites SET accepted = true, "acceptedTime" = $1 WHERE eid = $2 and uid = $3'
    db.query q, [now, eid, uid], callback
  
  unaccept: ({ eid, uid }, callback) ->
    now = Date.now()
    q = 'UPDATE invites SET accepted = false, "acceptedTime" = $1 WHERE eid = $2 and uid = $3'
    db.query q, [now, eid, uid], callback
  
  addList: (eid, inviter, users, callback) =>
    if users.length == 0
      return callback null, null

    # async.each users,
    #           ((user, cb) => module.exports.add {uid:user.uid, eid, inviter}, cb),
    #           callback
    # q = 'insert into invites (eid, uid, inviter, key) values '
    values = []
    keyMapping = {}
    for u in users
      if not keyMapping[u.uid]?
        key = randString 12
        keyMapping[u.uid] = key
        values.push "INSERT INTO invites
            (eid, uid, inviter, key)
          SELECT #{ [eid, u.uid, inviter, "'"+key+"'"].join ',' }
          WHERE
            NOT EXISTS (
              SELECT 1 FROM invites WHERE eid = #{eid} AND uid = #{u.uid}
            );"
    q = values.join ''
    # console.log q
    db.query q, [], (err, results) ->
      return callback err if err?
      callback null, keyMapping

randString = (n) ->
  text = ""
  possible = "abcdefghijklmnopqrstuvwxyz0123456789"
  for i in [0..n]
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  text