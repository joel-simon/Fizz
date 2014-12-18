async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
db        = require './../adapters/db.js'


module.exports = (data, socket, output, callback) ->
  { latlng } = data
  user = utils.getUserSession socket
  utils.log "Recieved postUpdateLocation",
            "User: " + JSON.stringify(user),
            "Data: " + JSON.stringify(data)

  q0 = 'UPDATE
          users
        SET
          "lastLocation" = ($3, $4),
          "lastLocationUpdate" = getNow()
        WHERE
          uid = $1;'

  # q1 = 'UPDATE
  #         events 
  #       SET
  #         "lastClusterUpdate" = $2
  #       WHERE
  #         events."deathTime" = 0 AND
  #         events.eid in
  #           (SELECT eid FROM invites where uid = $1 and accepted = true);'

  # q2 = 'SELECT
  #         events.eid, users.uid, users."lastLocation", users.name, users."lastLocationUpdate"
  #       FROM
  #         invites, events, users
  #       WHERE
  #         users.uid = invites.uid AND invites.eid = events.eid AND
  #         invites.accepted = true AND
  #         events.eid IN (SELECT eid FROM invites where uid = $1 and accepted = true);'
  #events.last_cluster_update < ($3 - 4*60*1000) AND
  now = Date.now()
  async.series [
    (cb)-> db.query q0, [user.uid, now, latlng.lat, latlng.lng], cb
    # (cb)-> db.query q1, [user.uid, now], cb
    # (cb)-> db.query q2, [user.uid], cb
  ], (err, results) ->
    # console.log err, results[2].rows[0]
    callback err, results
