async  = require 'async'
utils  = require './../utilities.js'
models = require './../models'

module.exports = (data, socket, output, callback) ->
  user = utils.getUserSession socket
  utils.log 'Recieved leaveEvent', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  uid  = user.uid
  async.parallel {
    leave  : (cb) -> models.invites.unaccept {eid, uid}, cb
    update : (cb) -> models.events.update eid, cb
    invited: (cb) -> models.events.getInviteList eid, cb
    guests : (cb) -> models.events.getGuestList eid, cb
  }, (err, results) ->
    return callback err if err?
    guests  = results.guests
    invited = results.invited
    output.emit 
      eventName : 'updateGuests'
      recipients: invited
      data      : { eid, guests }
    callback null