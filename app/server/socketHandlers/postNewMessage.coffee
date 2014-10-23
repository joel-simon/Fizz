async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  eventName = 'newMessage'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  eid  = data.eid
  text = data.text

  return console.log('No text') if !text? or text == ''

  models.messages.addMessage eid, user.uid, text, (err, message) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      output.emit { eventName, recipients, data: { message } }
      output.push { eid, recipients, msg : "#{user.name}: #{text}" }
      callback null