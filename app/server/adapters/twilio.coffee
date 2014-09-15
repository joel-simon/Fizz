async  = require 'async'
utils  = require '../utilities.js'
args   = require '../args.js'
config = require '../config'
twilio = require 'twilio'
client = new twilio.RestClient config.TWILIO.SID, config.TWILIO.TOKEN

module.exports = 
  sendSms : (msg, user) ->
    pn = user.pn
    utils.log "Sending SMS", {pn:pn}, {msg: msg}, {'args.sendSms': args.sendSms}
    return if not args.sendSms
    
    options =
      to:   pn
      from: '+14123301648'
      body: msg

    client.sms.messages.create options, (error, message) ->
      if error?
        utils.logError error
      # The HTTP request to Twilio will run asynchronously. This callback
      # function will be called when a response is received from Twilio
      # The "error" variable will contain error information, if any.
      # If the request was successful, this value will be "falsy"
      # if (!error) {
      #     # The second argument to the callback will contain the information
      #     # sent back by Twilio for the request. In this case, it is the
      #     # information about the text messsage you just sent:
      #     console.log('Success! The SID for this SMS message is:');
      #     console.log(message.sid);
   
      #     console.log('Message sent on:');
      #     console.log(message.dateCreated);
      # } else {
      #     console.log('Oops! There was an error.');
      # }