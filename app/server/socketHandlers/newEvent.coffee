async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  user       = utils.getUserSession socket
  text       = data.text
  location   = data.location || ''
  time       = data.time || 0
  eid = data.eid
  uid = data.uid

  utils.log "newEvent", {data}, {user}
  
  models.events.add user, text, (err, data) =>
    return callback err if err?
    eid = data.eid
    creationTime = data.creationTime
    messages = [{ mid:1, eid, uid, text, marker: null, creationTime }]
    newEvent =
      eid : eid
      creator : user.uid
      creationTime : creationTime
      messages : messages
      invites : [user]
      guests : [user.uid]
      clusters : []

    if socket.emit?
      socket.emit 'newEvent', newEvent

    callback null, newEvent
