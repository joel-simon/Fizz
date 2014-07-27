utils     = require './../utilities.js'
getUserSession = utils.getUserSession
async     = require 'async'
output    = require './../output.js'
emit      = output.emit
pushIos   = output.pushIos
types = require './../fizzTypes.js'
db = require './../adapters/db.js'
models = require './../models'
args = require './../args.js'
logError = utils.logError
log = utils.log

pretty = (s) -> JSON.stringify s, null, '\t'

QUERIES = 
  newMessages:
    "SELECT *
    FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages.creation_time >= $2
    order by creation_time"
  guests:
    "SELECT array_agg(invites.uid), invites.eid
    FROM invites, events WHERE
    events.eid = invites.eid AND 
    invites.accepted = true AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)
    GROUP BY invites.eid"
  newInvitees:
    "SELECT users.uid, users.pn, users.fbid, users.name, invites.eid 
    FROM invites, events, users WHERE
    users.uid = invites.uid AND 
    events.eid = invites.eid AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)"

connect = (socket, callback) ->
  return socket.emit('onLogin', {foo:42}); 
  if args.fakeData
    fakeData = require('./../fakeData').ONLOGIN
    log 'EMITTING FAKE onlogin:', fakeData
    socket.emit('onLogin', fakeData) if socket.emit
    return callback null

  start = new Date().getTime()
  user = getUserSession socket
  lastLogin = user.lastLogin
  eventListQuery =  "
    SELECT invites.eid FROM
    invites, events WHERE
    invites.uid = $1 AND
    invites.eid = events.eid AND
    events.death_time IS NULL
    "
  db.query eventListQuery, [user.uid], (err, results) ->
    return logError(err) if err
    eventList = results?.rows?.map((e) -> e.eid)
    eventListString = '{' + eventList + '}'
    async.parallel {              
      "newMessages": (cb) -> 
        values = [eventListString, lastLogin]
        db.query QUERIES.messages, values, (err, results) ->
          return cb err if err?
          data = {}
          for m in results.rows
            m.creationTime = +m.creation_time
            m.text = m.data
            delete m.creation_time
            delete m.data
            if not data[m.eid]
              data[m.eid] = []
            data[m.eid].push m
          cb null, data
      "guests": (cb) -> 
        values = [eventList, lastLogin]
        db.query QUERIES.guests, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = u.array_agg
          cb null, data
      "newInvitees": (cb) ->
        values = [eventList, lastLogin]
        db.query QUERIES.invitees, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = [] if not data[u.eid]?
            data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn,appUserDetails:{fbid:+u.fbid}});
          cb null, data
    }, (err, results) ->
      return callback err if err
      data =
        me : user
        newMessages   : results.newMessages
        newInvitees   : results.newInvitees
        guests        : results.guests
      end = new Date().getTime();
      time = end - start;

      if socket.emit
        socket.emit('onLogin', data);    
      callback null, data
      
module.exports = connect