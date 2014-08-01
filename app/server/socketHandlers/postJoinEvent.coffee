async  = require 'async'
utils  = require './../utilities.js'
models = require './../models'
output = require './../output.js'
db     = require './../adapters/db.js'
check  = require 'easy-types'

module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  utils.log 'Received joinEvent.', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  uid  = user.uid

  check(user).is 'user'
  check(eid).is 'posInt'

  async.parallel {
    join   : (cb) -> models.events.join eid, uid, cb
    invited: (cb) -> models.events.getInviteList eid, cb
    guests : (cb) -> models.events.getGuestList eid, cb
  }, (err, results) ->
    return callback err if err?
    guests  = results.guests
    invited = results.invited

    check(guests).is '[posInt]'
    check(invited).is '[user]'

    output.emit 
      eventName : 'updateGuests'
      recipients: invited
      data      : { eid, guests }
    callback null