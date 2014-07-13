utils = require './utilities'
dir = './socketHandlers/'

newEvent   = require dir+'newEvent'
joinEvent  = require dir+'joinEvent'
leaveEvent = require dir+'leaveEvent'
newInvites = require(dir+'newInvites')
newMessage = require(dir+'newMessage')
newMarker  = require(dir+'newMarker')
disconnect = require(dir+'disconnect')
locationChange     = require(dir+'locationChange')
getMoreMessages    = require dir+'getMoreMessages'

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
    socket.on 'getMoreMessages',(data) -> getMoreMessages data, socket, onError
    socket.on 'newMarker',      (data) -> newMarker data, socket, onError
    socket.on 'locationChange', (data) -> locationChange data, socket, onError
    socket.on 'disconnect', () -> disconnect socket, onError
