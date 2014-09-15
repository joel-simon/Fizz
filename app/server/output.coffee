# Wrappers for push, sms and socket output
utils    = require './utilities.js'
async    = require 'async'
args     = require './args.js'
twilio   = require './adapters/twilio'

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