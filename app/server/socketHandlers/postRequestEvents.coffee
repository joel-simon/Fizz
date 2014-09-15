async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'


module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  eid  = data.eid
  utils.log 'Recieved requestEvents', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  models.events.getFull eid, (err, event, messages, inviteList, guests) ->
    return callback err if err
    utils.log event
    toEmit = {
      eid, messages, inviteList, guests
      creator: event.creator
      creationTime: event.creationTime
      description : event.description
    }
    socket.emit 'newEvent', toEmit
    callback null, toEmit