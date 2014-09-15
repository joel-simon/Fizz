async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'

module.exports = (data, socket, callback) ->
  eventName = 'newMessage'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  text = data.text

  models.messages.addMessage eid, user.uid, text, (err, message) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      output.emit { eventName, recipients, data: { message } }
      callback null