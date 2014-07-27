async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  utils.log 'Join Event.', data

  user = utils.getUserSession(socket)
  eid = data.eid
  uid = user.uid

  async.parallel {
    join    : (cb) -> models.events.join eid, uid, cb
    invited : (cb) -> models.events.getInviteList eid, cb
    guests  : (cb) -> models.events.getGuestList eid, cb
  },
  (err, results) ->
    return callback err if err?
    output.emit 
      eventName : 'updateGuests'
      recipients: results.invited
      data :
        eid: eid
        guests: results.guest
    callback null