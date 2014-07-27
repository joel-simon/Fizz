async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  user        = utils.getUserSession socket
  description = data.description

  eid = data.eid
  uid = data.uid

  utils.log "newEvent", {data}, {user}
  
  models.events.add user, description, (err, event) =>
    return callback err if err?
    
    event.messages = []
    event.guests   = [user.uid]
    event.invites  = [user]

    if socket.emit?
      socket.emit 'newEvent', event

    callback null, event