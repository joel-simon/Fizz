# utils = require './utilities'
# dir = './socketHandlers/'

# handlerNames = [
#   'connect'
#   'postNewEvent'
#   'postJoinEvent'
#   'postLeaveEvent'
#   'postNewInvites'
#   'postNewMessage'
#   'postUpdateLocation'
#   'postUpdateEvent'
#   'postRequestEvents'
# ]

# disconnect = require(dir+'disconnect')

# handlers = {}
# for handler in handlerNames
#   handlers[handler] = require dir+handler


# callback = (handler) ->
#   (err, data) ->
#     if err?
#       utils.logError ' in '+handler+':'+err
#     else
#       utils.log handler+' successful:'+JSON.stringify(data)

# module.exports = (io) ->
#   io.sockets.on 'connection', (socket) ->
#     handlers.connect socket, (callback 'connect')

#     for k, v of handlers
#       console.log k, ''+v
#       if k != 'connect' and k != 'disconnect'
#         socket.on k, (data) -> v(data, socket, (callback k))

utils = require './utilities'
dir = './socketHandlers/'

connect         = require dir+'connect'
disconnect      = require dir+'disconnect'
postCompleteEvent = require dir+'postCompleteEvent'
postJoinEvent   = require dir+'postJoinEvent'
postLeaveEvent  = require dir+'postLeaveEvent'
postNewEvent    = require dir+'postNewEvent'
postNewInvites  = require dir+'postNewInvites'
postNewMessage  = require dir+'postNewMessage'
postRequestEvents  = require dir+'postRequestEvents'
postUpdateEvent    = require dir+'postUpdateEvent' 
postUpdateLocation = require dir+'postUpdateLocation'

onError = (err) ->
  if err
    utils.logError err

module.exports = (io) ->
  output = require('./output')(io)
  io.sockets.on 'connection', (socket) ->
    connect socket, onError
    socket.on 'postCompleteEvent',  (data) -> postCompleteEvent data, socket, output, onError
    socket.on 'postJoinEvent',      (data) -> postJoinEvent data, socket, output, onError
    socket.on 'postLeaveEvent',     (data) -> postLeaveEvent data, socket, output, onError
    socket.on 'postNewEvent',       (data) -> postNewEvent data, socket, output, onError
    socket.on 'postNewInvites',     (data) -> postNewInvites data, socket, output, onError
    socket.on 'postNewMessage',     (data) -> postNewMessage data, socket, output, onError
    socket.on 'postRequestEvents',  (data) -> postRequestEvents data, socket, output, onError
    socket.on 'postUpdateEvent',    (data) -> postUpdateLocation data, socket, output, onError
    socket.on 'postUpdateLocation', (data) -> postUpdateLocation data, socket, output, onError
    socket.on 'disconnect', () -> disconnect socket, onError