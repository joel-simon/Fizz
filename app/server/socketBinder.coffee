utils = require './utilities'
dir = './socketHandlers/'
sanitizer = require 'sanitizer'
socketBinders = require "./socketHandlers"
onError = (err) ->
  if err
    utils.logError err

module.exports = (io) ->
  output = require('./output')(io)
  io.sockets.on 'connection', (socket) ->
    socketBinders.connect socket, onError
    # socket.on 'postNewEvent',   (data) -> socketBinders.postNewEvent data, socket, output, onError
    # socket.on 'postJoinEvent',  (data) -> socketBinders.postJoinEvent data, socket, output, onError
    # socket.on 'postLeaveEvent', (data) -> socketBinders.postLeaveEvent data, socket, output, onError
    # socket.on 'postNewInvites', (data) -> socketBinders.postNewInvites data, socket, output, onError
    # socket.on 'postNewMessage', (data) -> socketBinders.postNewMessage data, socket, output, onError
    # socket.on 'connect',        (data) -> socketBinders.connect data, socket, output, onError
    # socket.on 'postUpdateEvent', (data) -> socketBinders.postUpdateEvent data, socket, output, onError
    # socket.on 'postUpdateLocation', (data) -> socketBinders.postUpdateLocation data, socket, output, onError
    # socket.on 'postRequestEvents',  (data) -> socketBinders.postRequestEvents data, socket, output, onError
    # socket.on 'postCompleteEvent', (data) -> socketBinders.postCompleteEvent data, socket, output, onError
    # socket.on 'disconnect', () -> socketBinders.disconnect socket, onError
    Object.keys(socketBinders).forEach (message) ->
      if message != 'connect' and message != 'disconnect'
        handler = socketBinders[message]
        socket.on message, (data) ->
          # data = JSON.parse sanitizer.sanitize(JSON.stringify(data))
          handler data, socket, output, onError
      #     dString = JSON.stringify data
      #     if dString == sanitizer.sanitize dString
      #       handler data, socket, output, onError
      #     else
      #       utils.log "Malformed Socket.io data", {dString}, {sanitized:sanitizer.sanitize dString}
      # 