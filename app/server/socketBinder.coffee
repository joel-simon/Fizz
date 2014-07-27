utils = require './utilities'
dir = './socketHandlers/'

handlerNames = [
  'connect'
  'newEvent'
  'joinEvent'
  'leaveEvent'
  'newInvites'
  'newMessage'
  'disconnect'
  'updateLocation'
  'updateEvent'
  'requestEvents'
]

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
      socket.on k, (data) -> v(data, socket, (callback k))
