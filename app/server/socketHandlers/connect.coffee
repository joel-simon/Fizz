utils  = require './../utilities.js'
async  = require 'async'
output = require './../output'
db     = require './../adapters/db.js'
models = require './../models'
args   = require './../args.js'

QUERIES = (eventListString, lastLogin) -> 
  newMessages: (cb)->
    q = 'SELECT *
    FROM messages WHERE
    messages.eid = ANY($1::int[]) AND
    messages."creationTime" >= $2
    order by "creationTime"
    LIMIT 10'
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for m in results.rows
        if not data[m.eid]
          data[m.eid] = []
        data[m.eid].push m
      cb null, data
  numMessages: (cb) ->
    q = 'SELECT 
        events.eid,
        count(messages)::int as "numM",
        "deathTime" is not NULL as completed
      FROM messages RIGHT OUTER JOIN events on (messages.eid = events.eid)
      WHERE 
        events.eid = ANY($1::int[])
      GROUP BY events.eid'
    db.query q,[eventListString], (err, results) ->
      cb null, results.rows || []
  guests: (cb) ->
    q = 'SELECT array_agg(invites.uid), invites.eid
    FROM invites WHERE
    accepted = true AND
    eid = ANY($1::int[]) AND
    "acceptedTime" >= $2
    GROUP BY eid'
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = u.array_agg
      cb null, data

  newInvitees: (cb) ->
    q = 'SELECT users.uid, users.pn, users.name, invites.eid 
    FROM invites, users WHERE
    users.uid = invites.uid AND
    invites."invitedTime" >= $2 AND
    invites.eid = ANY($1::int[])'
    db.query q, [eventListString, lastLogin], (err, results) ->
      return cb err if err?
      data = {}
      for u in results.rows
        data[u.eid] = [] if not data[u.eid]?
        data[u.eid].push({uid:u.uid,name:u.name,pn:u.pn})
      cb null, data

module.exports = (socket, callback) ->
  user = utils.getUserSession socket
  socket.join(''+user.uid)
  eventListQuery = 'SELECT invites.eid FROM
    invites, events WHERE
    invites.uid = $1 AND
    invites.eid = events.eid AND
    (events."deathTime" is NULL OR
      events."deathTime" > $2)'
  db.query eventListQuery, [user.uid, Date.now()], (err, results) ->
    return callback(err) if err?
    eventList = results?.rows?.map((e) -> e.eid)
    eventListString = '{'+eventList+'}'
    console.log {eventListString}
    db.query 'select "lastLogin" from users where uid = $1', [user.uid], (err, result)->
      return callback(err) if err?
      lastLogin = result.rows[0].lastLogin
      async.parallel QUERIES(eventListString, lastLogin), (err, results) ->
        return callback err if err

        data =
          me          : user
          eventList   : results.numMessages
          newMessages : results.newMessages
          newInvitees : results.newInvitees
          guests      : results.guests

        utils.log 'Emitting onLogin',
          "To: #{user.name}",
          "Data: "+JSON.stringify(data)
        socket.emit 'onLogin', data
        callback null, data