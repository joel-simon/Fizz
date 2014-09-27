async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  eventName = 'updateEvent'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  description = data.description

  models.events.updateDescription eid, description, (err) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      output.emit { eventName, recipients, data: { eid, description } }
      callback null