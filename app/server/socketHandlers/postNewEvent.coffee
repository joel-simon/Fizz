async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  utils.log "Recieved newEvent", "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  
  description = data.description  

  models.events.add user, description, (err, event) =>
    return callback err if err?
    
    toSend = 
      eid : event.eid
      creator: event.creator
      creationTime : event.creationTime
      messages : [] #no messages
      guests   : [user.uid] #host is going
      invites  : [user] #host is invited

    if socket.emit?
      socket.emit 'newEvent', toSend

    callback null, toSend