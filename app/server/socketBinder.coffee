utils = require './utilities'
dir = './socketHandlers/'

newEvent   = require dir+'newEvent'
joinEvent  = require dir+'joinEvent'
leaveEvent = require dir+'leaveEvent'
newInvites = require dir+'newInvites'
newMessage = require dir+'newMessage'
disconnect = require dir+'disconnect'
updateLocation = require dir+'updateLocation'
updateEvent = require dir+'updateEvent'
requestEvents = require dir+'requestEvents'

onError = (err) ->
  utils.logError err
  console.trace()

module.exports = (io) ->
  io.sockets.on 'connection', (socket) ->
    (require(dir+'connect'))(socket, onError)
    socket.on 'newEvent',       (data) -> newEvent data, socket, onError
    socket.on 'joinEvent',      (data) -> joinEvent data, socket, onError
    socket.on 'leaveEvent',     (data) -> leaveEvent data, socket, onError
    socket.on 'newInvites',     (data) -> newInvites data, socket, onError
    socket.on 'newMessage',     (data) -> newMessage data, socket, onError
    socket.on 'updateLocation', (data) -> updateLocation data, socket, onError
    socket.on 'updateEvent',    (data) -> updateEvent data, socket, onError
    socket.on 'requestEvents',  (data) -> requestEvents data, socket, onError
    socket.on 'disconnect', () -> disconnect socket, onError