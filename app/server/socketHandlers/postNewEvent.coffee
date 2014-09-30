async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  user = utils.getUserSession socket
  utils.log "Recieved newEvent", "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  
  description = data.description  

  models.events.add user, description, (err, event) =>
    return callback err if err?
    models.invites.add {eid: event.eid, uid: user.uid, inviter: user.uid, accepted : true}, (err) ->
      return callback err if err?
      
      toSend = 
        eid : event.eid
        creator: event.creator
        description : description
        creationTime : event.creationTime
        messages : [] #no messages
        guests   : [user.uid] #host is going
        inviteList : [user] #host is invited

      utils.log 'Emitting newEvent',
        "To: #{user.name}",
        "Data: "+JSON.stringify(toSend)
      socket.emit 'newEvent', toSend
      callback null, toSend