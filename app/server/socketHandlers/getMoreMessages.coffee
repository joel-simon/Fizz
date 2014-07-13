utils     = require './../utilities.js'
models 		= require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

getMoreMessages = (data, socket, callback) ->
	utils.log 'getMoreMessages', data

	eid = data?.eid
	oldestMid = data?.oldestMid
	# check.is data, {eid: "posInt", oldestMid: "posInt"}
	models.events.getMoreMessages eid, oldestMid, (err, messages) ->
		return callback err if err?
		socket.emit 'newMessages', { eid, messages }
		callback null
module.exports = getMoreMessages