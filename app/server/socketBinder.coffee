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

postNewEvent   = require dir+'postNewEvent'
postJoinEvent  = require dir+'postJoinEvent'
postLeaveEvent = require dir+'postLeaveEvent'
postNewInvites = require dir+'postNewInvites'
postNewMessage = require dir+'postNewMessage'
disconnect     = require dir+'disconnect'
postUpdateLocation = require(dir+'postUpdateLocation')
postRequestEvents  = require dir+'postRequestEvents'

onError = (err) ->
  if err
    utils.logError err
    console.trace()

module.exports = (io) ->
  io.sockets.on 'connection', (socket) ->
    (require(dir+'connect'))(socket, onError)
    socket.on 'postNewEvent',       (data) -> postNewEvent data, socket, onError
    socket.on 'postJoinEvent',      (data) -> postJoinEvent data, socket, onError
    socket.on 'postLeaveEvent',     (data) -> postLeaveEvent data, socket, onError
    socket.on 'postNewInvites',     (data) -> postNewInvites data, socket, onError
    socket.on 'postNewMessage',     (data) -> postNewMessage data, socket, onError
    socket.on 'postRequestEvents',(data) -> postRequestEvents data, socket, onError
    socket.on 'postUpdateLocation', (data) -> postUpdateLocation data, socket, onError
    socket.on 'disconnect', () -> disconnect socket, onError


