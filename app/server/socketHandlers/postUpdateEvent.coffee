async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  eventName = 'updateEvent'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  { eid, description } = data

  models.events.updateDescription eid, description, (err) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      text = "#{user.name} updated the event: #{description}"
      models.messages.addMessage eid, 0, text, (err, message) ->
        return callback err if err?
        output.emit { eventName: 'newMessage', recipients, data: { message } }
        output.emit { eventName, recipients, data: { eid, description } }
        callback null