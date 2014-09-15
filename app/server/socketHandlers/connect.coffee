utils  = require './../utilities.js'
async  = require 'async'
output = require './../output'
db     = require './../adapters/db.js'
models = require './../models'
args   = require './../args.js'

types  = require '../fizzTypes'
fakeData = require '../../../fakeData'

QUERIES = (eventListString, lastLogin) -> 
  # console.log 'lastLogin', lastLogin
  newMessages: (cb)->
    q = "SELECT *
    FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages.creation_time >= $2
    order by creation_time"
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for m in results.rows
        m.creationTime = +m.creation_time
        delete m.creation_time
        if not data[m.eid]
          data[m.eid] = []
        data[m.eid].push m
      cb null, data

  guests: (cb) ->
    q = "SELECT array_agg(invites.uid), invites.eid
    FROM invites, events WHERE
    events.eid = invites.eid AND 
    invites.accepted = true AND
    events.eid = ANY($1::int[]) AND
    events.last_accepted_update >= $2
    GROUP BY invites.eid"
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = u.array_agg
      cb null, data

  newInvitees: (cb) ->
    q = "SELECT users.uid, users.pn, users.name, invites.eid 
    FROM invites, users WHERE
    users.uid = invites.uid AND
    invites.invited_time >= $2 AND
    invites.eid = ANY($1::int[])"
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = [] if not data[u.eid]?
        data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn})
      cb null, data

connect = (socket, callback) ->
  user = utils.getUserSession socket
  socket.join(''+user.uid)
  eventListQuery =  "
    SELECT invites.eid FROM
    invites, events WHERE
    invites.uid = $1 AND
    invites.eid = events.eid AND
    events.death_time = 0
    "
  db.query eventListQuery, [user.uid], (err, results) ->
    return callback(err) if err?
    eventList = results?.rows?.map((e) -> e.eid)
    eventListString = '{' + eventList + '}'
    db.query "select last_login from users where uid = $1", [user.uid], (err, result)->
      return callback(err) if err?
      lastLogin = parseInt result.rows[0].last_login
      async.parallel QUERIES(eventListString, lastLogin), (err, results) ->
        return callback err if err
        data =
          me          : user
          eventList   : eventList
          newMessages : results.newMessages
          newInvitees : results.newInvitees
          guests      : results.guests

        
        socket.emit 'onLogin', data
        callback null, data
      
module.exports = connect