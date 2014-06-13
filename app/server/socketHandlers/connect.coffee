utils     = require './../utilities.js'
getUserSession = utils.getUserSession
fb        = require './../fb.js'
async     = require 'async'
output    = require './../output.js'
emit      = output.emit
pushIos   = output.pushIos
types = require './../fizzTypes.js'
check = require('easy-types').addTypes types
db = require './../db.js'
users = require './../users.js'
args = require './../args.js'
logError = utils.logError
pretty = (s) -> JSON.stringify s, null, '\t'

QUERIES = 
  newFriendList:
    "SELECT (users.uid, users.name, users.fbid)
    FROM users, new_friends
    WHERE new_friends.friend = users.uid AND new_friends.uid = $1"
  newEventList:
    "SELECT eid, creator, location, creation_time FROM
    events, invites WHERE
    events.eid = invites.eid AND
    invites.uid = $1 AND
    invites.invited_time >= $2 AND
    events.death_time IS NULL
    ORDER BY creation_time"
  newMessageList:
    "SELECT *
    FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages.creation_time >= $2
    order by creation_time"
  clusters:
    "SELECT eid, clusters
    FROM events WHERE
    events.eid = ANY($1::int[]) AND
    last_cluster_update >= $2"
  guests:
    "SELECT array_agg(invites.uid), invites.eid
    FROM invites, events WHERE
    events.eid = invites.eid AND 
    invites.accepted = true AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)
    GROUP BY invites.eid"
  invitees:
    "SELECT users.uid, users.pn, users.fbid, users.name, invites.eid 
    FROM invites, events, users WHERE
    users.uid = invites.uid AND 
    events.eid = invites.eid AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)"
  deadEventList:
    "SELECT events.eid
    FROM events, invites WHERE
    events.eid = invites.eid AND
    invites.uid = $1 AND
    events.death_time IS NOT NULL AND
    events.creation_time <= $2 AND
    events.death_time >= $2"
  updateUser:
    "UPDATE users
    SET last_login = $1
    WHERE uid = $2"
  suggestedInvites:
    "
    SELECT users.*, invites.eid FROM
    invites, events, users WHERE
    events.creator = $1 AND
    events.eid = invites.eid AND
    users.uid = invites.uid AND
    invites.confirmed = FALSE
    "

connect = (socket, cb) ->
  if (args.fakeData)
    fakeData = require('./../fakeData').ONLOGIN
    console.log 'EMITTING FAKE onlogin:', pretty fakeData
    socket.emit('onLogin', fakeData) if socket.emit
    return
  start = new Date().getTime();
  user = getUserSession(socket)
  lastLogin = user.appUserDetails.lastLogin
  query =  "
    SELECT invites.eid FROM
    invites, events WHERE
    invites.uid = $1 AND
    invites.eid = events.eid AND
    events.death_time IS NULL
    "
  db.query query, [user.uid], (err, results) ->
    return logError(err) if err
    invited_list = results?.rows?.map((e) -> e.eid)
    invited_list = '{' + invited_list + '}'
    async.parallel({
      "newFriendList": (cb) ->
        values = [user.uid]
        db.query QUERIES.newFriendList, values, cb
      "newEventList": (cb) -> 
        values = [user.uid, lastLogin]
        db.query QUERIES.newEventList, values, (err, results) ->
          return cb err if err?
          console.log 'newevents', results.rows
          for e in results.rows
            e.creationTime = +e.creation_time
            delete e.creation_time
          cb null, results.rows               
      "newMessageList": (cb) -> 
        values = [invited_list, lastLogin]
        db.query QUERIES.newMessageList, values, (err, results) ->
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
      "clusters": (cb) ->
        values = [invited_list, lastLogin]
        db.query QUERIES.clusters, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = u.clusters
          cb null, data
      "guests": (cb) -> 
        values = [invited_list, lastLogin]
        db.query QUERIES.guests, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = u.array_agg
          cb null, data
      "invitees": (cb) ->
        values = [invited_list, lastLogin]
        db.query QUERIES.invitees, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = [] if not data[u.eid]?
            data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn,appUserDetails:{fbid:u.uid}});
          cb null, data

      "deadEventList": (cb) ->
        values = [user.uid, lastLogin]
        db.query QUERIES.deadEventList, values, cb

      "fbToken" : (cb) ->
        users.getFbToken(user.uid, cb)

      # "updateUser" : (cb) ->
      #   db.query QUERIES.updateUser, [user.uid], cb
      "suggestedInvites" : (cb) ->
        db.query QUERIES.suggestedInvites,[user.uid], (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = [] if not data[u.eid]?
            data[u.eid].push(users.parse(u))
          cb null, data
    },
    (err, results) ->
      return console.log('Connection Err:',err) if err
      data =
        me : user
        newFriendList : results.newFriendList.rows
        newEventList  : results.newEventList
        newMessages   : results.newMessageList
        completeEventList : results.deadEventList.rows
        invitees      : results.invitees
        guests        : results.guests
        clusters      : results.clusters
        fbToken       : results.fbToken || ''
        suggestedInvites : results.suggestedInvites
      end = new Date().getTime();
      time = end - start;
      console.log 'Onlogin took:', time
      console.log 'Emitting:', (JSON.stringify data,null,'\t')
      if socket.emit?
        socket.emit('onLogin', data)
      cb(null) if cb?
      )

module.exports = connect