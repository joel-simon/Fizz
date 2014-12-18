apn      = require 'apn'
utils    = require '../utilities.js'

apnConnection = new apn.Connection {
  key:  __dirname + '/newcert.pem'
  cert: __dirname + '/PushChatCert.pem'
  gateway: "gateway.push.apple.com"
  address: "gateway.push.apple.com"
}

apnConnection.on 'connected', () ->
    utils.log "APN Connected"

# apnConnection.on('transmissionError', function(errCode, notification, device) {
#     utils.error("Notification caused error: " + errCode + " for device ", device, notification);
# });

# apnConnection.on('timeout', function () {
#     utils.log("Connection Timeout");
# });


apnConnection.on('socketError', utils.logError);

feedback = new apn.Feedback {
  "batchFeedback": false
  "interval": 300
}

feedback.on "feedback", (devices) ->
  utils.log devices

module.exports = 
  send : (data, phoneToken) ->
    hoursToExpiration = 1

    try
      myDevice = new apn.Device(phoneToken)
      note = new apn.Notification()
      note.expiry = Math.floor(Date.now() / 1000) + 3600*hoursToExpiration
      note.badge = 1
      note.sound = "ping.aiff"
      note.alert = data.message
      note.payload = data
  
      apnConnection.pushNotification note, myDevice
    catch e
      return utils.logError "Failed to do apn push.\nERR:#{e}\nToken:#{phoneToken}"