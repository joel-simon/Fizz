events   = require('./events.js'),
utils     = require('./utilities.js'),
logError  = utils.logError,
log       = utils.log,
debug     = utils.debug,
fb        = require('./fb.js'),
users     = require('./users.js'),
async     = require('async'),
output    = require('./output.js'),
emit      = output.emit,
pushIos   = output.pushIos,
exports = module.exports,
types = require('./../fizzTypes.js'),
check = require('easy-types').addTypes(types)

getUserSession = (socket) ->
  socket.handshake.user
  # check.is(user, 'user')

module.exports = (data, socket, cb = console.log) ->
  console.log('suggestInvitedList data:', data)
  check.is(data, { eid: 'posInt', inviteList: '[user]'})
  eid = data.eid
  inviteList = data.inviteList
  q1 = "SELECT user.uid,name FROM
        users, events WHERE
        events.creator = users.uid AND
        events.eid = $1"
  db.query q1, [eid], (err, result) ->
    return cb(err) if err?
    creator = +result.rows[0].eid
    events.addInvites(eid, inviteList, (eid == creator), function(){
      return cb(err) if err;
      var data = {}
      data[eid] = [inviteList]
      emit({ 
        eventName: 'newSuggestedInvites',
        data: data,
        recipients: newInvites
      })
      cb();