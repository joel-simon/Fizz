utils = require './utilities'
dir = './socketHandlers/'

handlerNames = [
  'connect'
  'postNewEvent'
  'postJoinEvent'
  'postLeaveEvent'
  'postNewInvites'
  'postNewMessage'
  'postUpdateLocation'
  'postUpdateEvent'
  'postRequestEvents'
]

disconnect = require(dir+'disconnect')

handlers = {}
for handler in handlerNames
  handlers[handler] = require dir+handler

callback = (handler) ->
  (err, data) ->
    if err
      utils.logError ' in '+handler+':'+err
    else
      utils.log handler+' successful:'+JSON.stringify(data)

module.exports = (io) ->
  io.sockets.on 'connection', (socket) ->
    handlers.connect socket, (callback 'connect')
    for k, v of handlers
      # console.log 
      if k != 'connect' and k != 'disconnect'
        socket.on k, (data) -> v(data, socket, (callback k))
