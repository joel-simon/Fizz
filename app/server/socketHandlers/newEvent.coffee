events = require './../events'
async  = require 'async'
SocketHandler = require './SocketHandler'
utils     = require('./../utilities.js')
logError = utils.logError
class NewEvent extends SocketHandler
  handle: (data, socket, cb) ->
    user       = @getUserSession(socket)
    text       = data.text;
    console.log user, @logError
    events.add user, text, (err, eid) =>
      console.log  @
      return logError(err) if err
      async.parallel {
        event: (cb) -> events.get(eid, cb)
        messages: (cb) -> events.getMoreMessages(eid, 0, cb)
      },
      (err, result) ->
        messages = result.messages;
        evnt = result.event;
        data = {};
        data[eid] = [{
          eid : evnt.eid
          creator : user.uid
          creationTime : evnt.creationTime
          messages : messages
          invites : [user]
          guests : [user.uid]
          clusters : []
        }]
        console.log('Emitting from newEvent:', JSON.stringify(data));
        if cb
          cb null, eid;
      # try { socket.emit('newEvents', data) } catch(e){}

module.exports = NewEvent