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

testKey = 'APA91bFuGh4WDMoPnoxZe1bbKryv2cbPAbD8EWSvR8bM20qBIBET-hoqx1zJt5W2Y3wIcSf8Lbu4WofNj5EsPx8VJdizxzaR5YsFKIhuIpOkcWKPZQmn7Z9g-eWcfMGeKleE3UM_JJ_zgwrlJwKFzGM4CymvMXGynA'
module.exports.send 'test', testKey, () ->
  console.log JSON.stringify(arguments)