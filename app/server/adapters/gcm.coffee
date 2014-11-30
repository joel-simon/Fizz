gcm = require 'node-gcm'
utils    = require '../utilities.js'
apiKey = 'AIzaSyD2HoTbAXUqrjEyHj7zRWEqrlR7FaoTYO4'
# create a message with default values
module.exports =
  send: (data, registrationIds, callback) ->
    utils.log 'pushing', {data}, {registrationIds}
    sender = new gcm.Sender apiKey
    message = new gcm.Message()
    message.addDataWithObject data
    sender.send message, registrationIds, 4, (err, result) ->
      utils.log 'Pushed', {err}, {result}
      if err or result.failure > 0
        utils.logError 'gcm push failed', result
