# Wrappers for push, sms and socket output
utils  = require './utilities.js'
async  = require 'async'
args   = require './args.js'
twilio = require './adapters/twilio'
gcm    = require './adapter.gcm'  
apn    = require './adapter.apn'
models = require './models'

io = null
module.exports = 
  sendSms : twilio.sendSms
  emit : (options) ->
    { eventName, data, recipients } = options
    if not io
      io = require('../../app.js').io

    utils.log 'Emitting '+eventName,
      'To:   '+JSON.stringify recipients.map( (u)-> u.name ),
      'Data: '+JSON.stringify data

    async.each recipients, (user, callback) ->
      if (io)
        io.sockets.in(user.uid).emit eventName, data
      callback()
  push : ({ recipients, msg, eid }) ->
    recipients.forEach (user) ->
      models.users.get {id: user.uid}, ['platform', 'phone_token'], (err, results) ->
        if err? return utils.logError err
        { platform, phone_token } = results
        if platform == 'ios'
          apn.send msg, phone_token, eid
        else if platform == 'android'
          gcm.send msg, [phone_token], eid, (() ->)
