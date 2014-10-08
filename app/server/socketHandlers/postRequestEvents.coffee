async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  user = utils.getUserSession socket
  utils.log 'Recieved requestEvents', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  {eidList} = data
  eidList.forEach (eid) ->
    models.events.getFull eid, (err, event, messages, inviteList, guests) ->
      return callback err if err
      utils.log event
      toEmit = {
        eid, messages, inviteList, guests
        creator: event.creator
        creationTime: event.creationTime
        description : event.description
      }
      utils.log "Emitting newEvent",
        "Data: #{JSON.stringify toEmit}",
        'To:'+ [user.uid, user.name]
      socket.emit 'newEvent', toEmit
  callback null