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

QUERIES = 
  newFriendList: 
    "
    SELECT (users.uid, users.name, users.fbid)
    FROM users, new_friends
    WHERE new_friends.friend = users.uid AND new_friends.uid = $1
    "
  newEventList:
    "
    SELECT events.eid, events.creator, events.creation_time
    FROM events, invites where
    invites.uid = $1 AND
    events.eid = invites.eid AND
    events.creation_time >= date($2)
    ORDER BY creation_time
    "
  newMessageList:
    "
    SELECT * FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages.creation_time >= date($2)
    order by creation_time
    "
  clusters:
    "
    SELECT eid, clusters
    FROM events WHERE
    events.eid = ANY($1::int[]) AND
    last_cluster_update >= date($2)
    "
  guests:
    "
    SELECT array_agg(invites.uid), invites.eid
    FROM invites, events WHERE
    events.eid = invites.eid AND 
    invites.accepted = true AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)
    GROUP BY invites.eid
    "
  invitees:
    "
    SELECT users.uid, users.pn, users.fbid, users.name, invites.eid 
    FROM invites, events, users WHERE
    users.uid = invites.uid AND 
    events.eid = invites.eid AND
    events.eid = ANY($1::int[]) AND
    (events.last_cluster_update >= $2 OR events.last_accepted_update > $2)
    "

handle = (socket, cb) ->
  user = getUserSession(socket)
  console.log user
  query =  "SELECT eid FROM invites WHERE uid = $1"
  db.query query, [user.uid], (err, results) ->
    return logError(err) if err
    invited_list = results?.rows?.map((e) -> e.eid)
    invited_list = '{' + invited_list + '}'
    async.parallel({
      "newFriendList": (cb) ->
        values = [user.uid]
        db.query QUERIES.newFriendList, values, cb
      "newEventList": (cb) -> 
        values = [user.uid, user.appUserDetails.lastLogin]
        db.query QUERIES.newEventList, values, cb
      "newMessageList": (cb) -> 
        values = [invited_list, user.appUserDetails.lastLogin]
        db.query QUERIES.newMessageList, values, cb
      "clusters": (cb) ->
        values = [invited_list, user.appUserDetails.lastLogin]
        db.query QUERIES.clusters, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = u.clusters
          cb null, data
      "guests": (cb) -> 
        values = [invited_list, user.appUserDetails.lastLogin]
        db.query QUERIES.guests, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = u.array_agg
          cb null, data
      "invitees": (cb) ->
        values = [invited_list, user.appUserDetails.lastLogin]
        db.query QUERIES.invitees, values, (err, results) ->
          return cb err if err?
          data = {}
          for u in results.rows
            data[u.eid] = [] if not data[u.eid]?
            data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn,appUserDetails:{fbid:u.uid}});
          cb null, data

      "deadEventList": (cb) ->
        cb null, {rows:[]}
    },
    (err, results) ->
      return console.log('Connection Err:',err) if err
      data =
        me : user
        newFriendList : results.newFriendList.rows
        newEventList  : results.newEventList.rows
        newMessages   : results.newMessageList.rows
        deadEventList : results.deadEventList.rows
        invitees      : results.invitees
        guests        : results.guests
        clusters      : results.clusters
        fbToken       : user.fbToken
        suggestedInvites : []
      
      console.log 'Emitting:', data
      if socket.emit?
        socket.emit('onLogin', data)
      cb(null) if cb?
      )

module.exports = handle