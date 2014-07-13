async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  utils.log 'Leave Event', data
  check.is data, {eid: 'posInt'}

  user = getUserSession socket
  eid = data.eid
  uid = user.uid

  async.parallel {
    leave:   (cb) -> models.events.leave eid, uid, cb
    invited: (cb) -> models.events.getInviteList eid, cb
    guests:  (cb) -> models.events.getGuestList eid, cb
  },
  (err, results) ->
    return callback err if err?
    output.emit 
      eventName : 'updateGuests'
      data      : { eid, guests: results.guests }
      recipients: results.invited
    callback null