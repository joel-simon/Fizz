db = require './../db'
events = require './../events'

getMoreMessages = (data, socket) ->
	eid = data?.eid
	oldestMid = data?.oldestMid
	# check.is data, {eid: "posInt", oldestMid: "posInt"}

	events.getMoreMessages eid, oldestMid, (err, messages) ->
		if err
			logError(err)
		else 
			socket.emit 'newMessages', { eid: eid, messages: messages }

module.exports = getMoreMessages