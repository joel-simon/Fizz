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
    socket.on 'disconnect', () -> socketBinders.disconnect socket, onError
    Object.keys(socketBinders).forEach (message) ->
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