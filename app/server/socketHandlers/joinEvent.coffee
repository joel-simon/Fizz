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
pg = require('pg')
db = require('./../db.js')
getUserSession = utils.getUserSession

dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb'


module.exports = (data, socket, cb) ->
  console.log 'JOIN EVENT DATA:', JSON.stringify data
  check.is(data, {eid: 'posInt'})

  user = getUserSession(socket)
  eid = data.eid
  uid = user.uid

  async.parallel {
    join :    (cb) -> events.join eid, uid, cb
    invited : (cb) ->events.getInviteList eid, cb
  },
  (err, results) ->
    console.log('done join event', err)
    if (cb) cb err
    else if (err) logError err
    else if (socket.emit)
      emit 
        eventName : 'addGuest'
        data      : { eid: eid, uid: uid }
        recipients: results.invited