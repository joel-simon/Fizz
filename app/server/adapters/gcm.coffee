gcm = require 'node-gcm'
utils    = require '../utilities.js'
apiKey = 'AIzaSyD2HoTbAXUqrjEyHj7zRWEqrlR7FaoTYO4'
# create a message with default values
module.exports =
  send: (data, registrationIds, callback) ->
    sender = new gcm.Sender apiKey
    message = new gcm.Message()
    message.addDataWithObject data
    # message.addDataWithKeyValue 'message', text
    # message.addDataWithKeyValue 'eid', 123
    sender.send message, registrationIds, 4, (err, result) ->
    	if err or result.failure > 0
    		utils.logError 'gcm push failed', result
