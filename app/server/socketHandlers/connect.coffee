utils  = require './../utilities.js'
async  = require 'async'
output = require './../output.js'
db     = require './../adapters/db.js'
models = require './../models'
args   = require './../args.js'
types  = require '../fizzTypes'
check  = require('easy-types')

check.prototype.addTypes(types)

QUERIES = (eventListString, user) -> 
  newMessages: (cb)->
    q = "SELECT *
    FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages.creation_time >= $2
    order by creation_time"
    db.query q, [eventListString, user.lastLogin], (err, results) ->
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
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)
    GROUP BY invites.eid"
    db.query q, [eventListString, user.lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = u.array_agg
      cb null, data

  newInvitees: (cb) ->
    q = "SELECT users.uid, users.pn, users.name, invites.eid 
    FROM invites, events, users WHERE
    users.uid = invites.uid AND 
    events.eid = invites.eid AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)"
    db.query q, [eventListString, user.lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = [] if not data[u.eid]?
        data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn});
      cb null, data

connect = (socket, callback) ->
  if args.fakeData
    fakeData = require('./../fakeData').ONLOGIN
    utils.log 'EMITTING FAKE onlogin:', fakeData
    socket.emit('onLogin', fakeData) if socket.emit
    return callback null

  user = utils.getUserSession socket
  check(user).is 'user'

  socket.join(''+user.uid)
  eventListQuery =  "
    SELECT invites.eid FROM
    invites, events WHERE
    invites.uid = $1 AND
    invites.eid = events.eid AND
    events.death_time IS NULL
    "
  db.query eventListQuery, [user.uid], (err, results) ->
    return callback(err) if err?
    eventList = results?.rows?.map((e) -> e.eid)
    eventListString = '{' + eventList + '}'
    async.parallel QUERIES(eventListString, user), (err, results) ->
      return callback err if err
      data =
        me          : user
        eventList   : eventList
        newMessages : results.newMessages
        newInvitees : results.newInvitees
        guests      : results.guests

      check(data).is {
        me: 'user'
        eventList:   '[posInt]'
        newMessages: 'object'
        newInvitees: 'object'
      }

      if socket.emit
        socket.emit('onLogin', data)
      
      callback null, data
      
module.exports = connect