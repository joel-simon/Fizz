async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'

module.exports = (data, socket, output, callback) ->
  eventName = 'completeEvent'
  user = utils.getUserSession socket
  utils.log "Recieved #{eventName}",
            "User:"+ JSON.stringify(user),
            "Data:"+ JSON.stringify(data)
  {eid, completed} = data

  models.events.updateCompleted data, (err) ->
    return callback err if err?
    models.events.getInviteList eid, (err, recipients) ->
      return callback err if err?
      if completed
        text = "#{user.name} set the event to complete, it will fade in 24h."
      else
        text = "#{user.name} set the event to incomplete." 
      models.messages.addMessage eid, 0, text, (err, message) ->
        return callback err if err?
        output.emit { eventName: 'newMessage', recipients, data: { message } }
        output.emit { eventName, recipients, data }
        callback null