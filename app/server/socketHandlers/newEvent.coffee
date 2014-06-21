events = require './../events'
async  = require 'async'
SocketHandler = require './SocketHandler'
utils     = require('./../utilities.js')
logError = utils.logError
log = utils.log
getUserSession = utils.getUserSession

module.exports = (data, socket, cb) ->
    handle = cb || console.log 
    user       = getUserSession(socket)
    text       = data.text;
    location   = data.location || '';
    time       = data.time || 0;
    log "New Event called", data 
    events.add user, text, (err, data) =>
      return (handle err) if err?
      eid = data.eid
      creationTime = data.creationTime
      messages = [{mid:1, eid:data.eid, uid:user.uid, text:text, marker:null,creationTime:creationTime}];
      newEvent =
        eid : eid
        creator : user.uid
        creationTime : creationTime
        messages : messages
        invites : [user]
        guests : [user.uid]
        clusters : []
      log 'Emitting from New Event', newEvent
      if cb
        cb err, eid
      if (socket.emit)
        socket.emit 'newEvent', newEvent
