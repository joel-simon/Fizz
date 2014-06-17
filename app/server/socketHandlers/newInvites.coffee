events   = require('./../events')
utils     = require('./../utilities.js')
users     = require('./../users.js')
async     = require('async')
output    = require('./../output.js')
emit      = output.emit
pushIos   = output.pushIos
exports = module.exports
types = require('./../fizzTypes.js')
check = require('easy-types').addTypes(types)
nameShorten = utils.nameShorten;

getUserSession = (socket) ->
  socket.handshake.user
  # check.is(user, 'user');

module.exports = (data, socket, callback = console.log) ->
  check.is(data, { eid: 'posInt', inviteList: '[user]'})
  user = getUserSession(socket);
  eid = data.eid
  newInvites = data.inviteList
  events.get eid, (err, event) ->
    return callback(err) if err?
    if user.uid == event.creator
      isHost(user, event, newInvites, callback)
    else isNotHost(user, event, newInvites, callback)

isNotHost = (user, event, newInvites, callback) ->
  async.parallel {
    add: (cb) ->
      events.addInvites event.eid, user.uid, newInvites, false, cb,
    creator: (cb) ->
      users.get event.creator, cb
  }, (err, results) ->
    return callback(err) if err
    emit({ 
      eventName: 'newSuggestedInvites'
      data:
        eid: eid
        inviter: user.uid
        invitees: newInvites
      recipients: [results.creator]
    })
    callback(null)

isHost = (user, event, newInvites, callback) ->
  async.series {
    add: (cb) -> events.addInvites event.eid, user.uid, newInvites, true, cb
    creator: (cb) -> users.get event.creator, cb
    messages: (cb) -> events.getMoreMessages event.eid, 0, cb
    invited : (cb)-> events.getInviteList event.eid, cb
    guests: (cb) -> events.getGuestList event.eid, cb
  }, (err, results) ->
    return callback(err) if err?
    creator = results.creator
    messages = results.messages
    oldInvites = results.invited
    allInvites = newInvites.concat oldInvites
    
    data: [
      eid : event.eid
      creator : event.creator
      creationTime : event.creationTime
      messages : messages
      invites:  allInvites
      guests:  results.guests
      clusters: event.clusters
      time : event.creationTime
      location: event.location
    ]
    emit
      eventName: 'newEvent'
      data:data
      recipients:newInvites

    emit
      eventName: 'updateInvitees'
      data:
        eid: event.eid
        unvitees: allInvites
      recipients: oldInvites
    
    callback(null)
    # # Push to people that they are invited.
    # pushIos({
    #   msg: msgOut,
    #   userList : newInvites,
    #   eid: eid
    # });

    # var data = {}
    # data[e.eid] = inviteList;
    # emit({ # Let other people that new people have been invited. 
    #   eventName: 'updateInvitees',
    #   data: data,
    #   recipients: inviteList
    # });
    # sms those smsUers who have been invited. 
    # output.sendGroupSms(results.pnUsers , eid, function(user) {
    #   return msgOut+'\nRespond to join the event.\n'+server+user.key;
    # });
