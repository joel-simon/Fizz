async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'
check  = require('easy-types')

module.exports = (data, socket, callback) ->
  eventName = 'updateEvent'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  description = data.description

  models.events.updateDescription eid, description, (err) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      check(recipients).is '[user]'
      output.emit { eventName, recipients, data: { eid, description } }
      callback null