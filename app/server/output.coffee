# Wrappers for push, sms and socket output
utils  = require './utilities.js'
async  = require 'async'
args   = require './args.js'
twilio = require './adapters/twilio'
gcm    = require './adapters/gcm'  
apn    = require './adapters/apn'
models = require './models'

# gcm.send '0xF0 0x9F 0x98 0x84', ['APA91bEX5ktXq3bFwjSROhJIc1uuLlnxuI_FIxvZkl2K4mQw-3KUd-e8NEUts7SJKy9WNN9pR9-RjEcaW0AJuryVGcj7MJbURY7VfUnZJc_6TOX3HLAROfxWy0LH3LYSL5Fxv1xI16m1ZZvLrSaMirJBkSug6ecf1w'], (err, result)->
#   console.log {err}, result

module.exports = (io) -> {
  sendSms : twilio.sendSms
  emit : (options) ->
    { eventName, data, recipients } = options

    utils.log 'Emitting '+eventName,
      'To:   '+JSON.stringify recipients.map( (u)-> u.name ),
      'Data: '+JSON.stringify data

    recipients.forEach (user) ->
      io.sockets.in(''+user.uid).emit eventName, data

  push : ({ recipients, msg, eid }) ->
    recipients.forEach (user) ->
      models.users.get {id: user.uid}, ['platform', 'phone_token'], (err, results) ->
        if err? 
          return utils.logError err
        { platform, phone_token } = results
        data = {message: msg, eid}
        if platform == 'ios'
          apn.send data, phone_token
        else if platform == 'android'
          gcm.send data, [phone_token]
  }