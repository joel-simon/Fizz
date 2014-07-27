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

# handlers['newEvent']   = require dir+'newEvent'
# handlers['joinEvent']  = require dir+'joinEvent'
# handlers['leaveEvent'] = require dir+'leaveEvent'
# handlers['newInvites'] = require dir+'newInvites'
# handlers['newMessage'] = require dir+'newMessage'
# handlers['disconnect'] = require dir+'disconnect'
# handlers['updateLocation'] = require dir+'updateLocation'
# handlers['updateEvent']    = require dir+'updateEvent'
# handlers['requestEvents']  = require dir+'requestEvents'
# connect        = require dir+'connect'

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
    
    # socket.on 'newEvent',       (data) -> newEvent data, socket, onError
    # socket.on 'joinEvent',      (data) -> joinEvent data, socket, onError
    # socket.on 'leaveEvent',     (data) -> leaveEvent data, socket, onError
    # socket.on 'newInvites',     (data) -> newInvites data, socket, onError
    # socket.on 'newMessage',     (data) -> newMessage data, socket, onError
    # socket.on 'updateLocation', (data) -> updateLocation data, socket, onError
    # socket.on 'updateEvent',    (data) -> updateEvent data, socket, onError
    # socket.on 'requestEvents',  (data) -> requestEvents data, socket, onError
    # socket.on 'disconnect', () -> disconnect socket, onError