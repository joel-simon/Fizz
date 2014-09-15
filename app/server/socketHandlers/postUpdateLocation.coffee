async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  { location } = data
  user = utils.getUserSession socket
  utils.log "Recieved postUpdateLocation",
            "User: " + JSON.stringify(user),
            "Data: " + JSON.stringify(data)
  
  q0 = "UPDATE
          users
        SET
          last_location = ($3, $4),
          last_location_update = $2
        WHERE
          uid = $1;"

  q1 = "UPDATE
          events 
        SET
          last_cluster_update = $2
        WHERE
          events.death_time = 0 AND
          events.eid in
            (SELECT eid FROM invites where uid = $1 and accepted = true);"

  q2 = "SELECT
          events.eid, users.uid, users.last_location, users.name, users.last_location_update
        FROM
          invites, events, users
        WHERE
          users.uid = invites.uid AND invites.eid = events.eid AND
          invites.accepted = true AND
          events.eid IN (SELECT eid FROM invites where uid = $1 and accepted = true);"
  #events.last_cluster_update < ($3 - 4*60*1000) AND
  now = Date.now()
  async.series [
    (cb)-> db.query q0, [user.uid, now, location.lat, location.lng], cb
    (cb)-> db.query q1, [user.uid, now], cb
    (cb)-> db.query q2, [user.uid], cb
  ], (err, results) ->
    # console.log err, results[2].rows[0]
    callback err, results
