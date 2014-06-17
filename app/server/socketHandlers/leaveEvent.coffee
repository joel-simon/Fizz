events   = require('./../events')
utils     = require('./../utilities.js')
logError  = utils.logError
log       = utils.log
debug     = utils.debug
fb        = require('./../fb.js')
users     = require('./../users.js')
async     = require('async')
output    = require('./../output.js')
emit      = output.emit
pushIos   = output.pushIos
exports = module.exports
types = require('./../fizzTypes.js')
check = require('easy-types').addTypes(types)
db = require('./../db.js')
getUserSession = utils.getUserSession

module.exports = (data, socket, cb) ->
  console.log 'LEAVE EVENT DATA:', JSON.stringify data
  check.is(data, {eid: 'posInt'})

  user = getUserSession(socket)
  eid = data.eid
  uid = user.uid

  async.parallel {
    leave :    (cb) -> events.leave eid, uid, cb
    invited : (cb) -> events.getInviteList eid, cb
    guests : (cb) -> getGuestList eid, cb
  },
  (err, results) ->
    console.log('done join event', err)
    if (cb) cb err
    else if (err) logError err
    else if (socket.emit)
      emit 
        eventName : 'updateGuests'
        data      : { eid: eid, guests: results.guests }
        recipients: results.invited