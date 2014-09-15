gcm = require 'node-gcm'
apiKey = 'AIzaSyD2HoTbAXUqrjEyHj7zRWEqrlR7FaoTYO4'
# create a message with default values
module.exports =
  send: (text, registrationIds, callback) ->
    sender = new gcm.Sender apiKey
    message = new gcm.Message()
    message.addDataWithKeyValue 'key1', text
    console.log 'here'
    sender.send message, registrationIds, 4, callback