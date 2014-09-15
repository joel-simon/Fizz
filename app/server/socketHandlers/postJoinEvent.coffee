async  = require 'async'
utils  = require './../utilities.js'
models = require './../models'
output = require './../output'
db     = require './../adapters/db.js'
module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  utils.log 'Received joinEvent.', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  uid  = user.uid

  async.parallel {
    join   : (cb) -> models.invites.accept {eid, uid}, cb
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