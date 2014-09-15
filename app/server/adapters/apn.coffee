
apn      = require 'apn'
utils    = require '../utilities.js'

apnConnection = new apn.Connection {
  key:  __dirname + '/newcert.pem'
  cert: __dirname + '/PushChatCert.pem'
  gateway: "gateway.push.apple.com"
  address: "gateway.push.apple.com"
}

# apnConnection.on('connected', function() {
#     utils.log("APN Connected");
# });

# apnConnection.on('transmitted', function(notification, device) {
#     utils.log("Notification transmitted to:" + device.token.toString('hex'));
# });

# apnConnection.on('transmissionError', function(errCode, notification, device) {
#     utils.error("Notification caused error: " + errCode + " for device ", device, notification);
# });

# apnConnection.on('timeout', function () {
#     utils.log("Connection Timeout");
# });

# apnConnection.on('disconnected', function() {
#     utils.log("Disconnected from APNS");
# });

apnConnection.on('socketError', utils.logError);

feedback = new apn.Feedback{
  "batchFeedback": false
  "interval": 300
}

feedback.on "feedback", (devices) ->
  utils.log devices

module.exports = 
  send : (msg, user, eid, hoursToExpiration) ->
    models.users.getIosToken user.uid, (err, iosToken) ->
      return logError err if err?
      mainLog = "Sending push to #{user.name}"
      toLog = "msg:#{msg}\n\t\ttoken:#{iosToken}\n\t\teid:#{eid}"
      
      if iosToken == 'iosToken'
        return utils.log mainLog, toLog, 'Status: FAILED! Token is fake as shit:'+iosToken
      if not msg
        return utils.log mainLog, toLog, 'Status: FAILED! MSG is bad:'+msg
      if not iosToken
        return logError('No token found for'+JSON.stringify(user))
      
      try {
        myDevice = new apn.Device iosToken
        note = new apn.Notification()
        note.expiry = Math.floor(Date.now() / 1000) + 3600*hoursToExpiration;
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = msg
        note.payload = { 'messageFrom':'Fizz', eid }
    
        apnConnection.pushNotification(note, myDevice)
      } catch(e) {
        return utils.logError (mainLog, toLog, "Status: FAILED.",'ERR:'+e,'Token:'+iosToken)
      }
      utils.log mainLog, toLog, "Status: Success."