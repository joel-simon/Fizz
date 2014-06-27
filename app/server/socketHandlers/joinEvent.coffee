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

module.exports = (data, socket) ->
  log 'Join Event.', data
  check.is(data, {eid: 'posInt'})

  user = getUserSession(socket)
  eid = data.eid
  uid = user.uid

  async.parallel {
    join :    (cb) -> events.join eid, uid, cb
    invited : (cb) -> events.getInviteList eid, cb
    guests : (cb) -> getGuestList eid, cb
  },
  (err, results) ->
    return logError err if err?
      emit 
        eventName : 'updateGuests'
        recipients: results.invited
        data :
          eid: eid
          guests: results.guest
        