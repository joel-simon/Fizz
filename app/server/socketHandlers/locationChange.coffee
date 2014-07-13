async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  utils.log 'locationChange', data

  q1 = "update users set last_location = (lat,lng) where uid = $2"
  q2 = "SELECT (uid, last_location, eid)
        FROM invites as a, invites as b, events, users as u WHERE
        a.eid = b.eid AND a.eid = e.eid AND
        a.uid = my_uid and
        b.uid = u.uid
        and a.accepted = true and b.accepted = true and
        e.last_cluster_update < (NOW()-INTERVAL '4 minutes')"

  q3 = "UPDATE events SET last_cluster_update = NOW()"
  callback null