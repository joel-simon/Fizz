async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  eid  = data.eid
  utils.log 'Recieved requestEvents', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  models.events.getFull eid, (err, event, messages, inviteList, guests) ->
    return callback err if err
    toEmit = {
      eid, messages, inviteList, guests
      creator: event.creator
      creationTime: event.creation_time
      description : event.description
    }
    console.log 'toEmit:' , toEmit
    socket.emit 'newEvent', toEmit
    callback toEmit