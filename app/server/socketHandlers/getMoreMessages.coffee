db = require './../db'
events = require './../events'

getMoreMessages = (data, socket, cb) ->
	eid = data?.eid
	oldestMid = data?.oldestMid
	# check.is data, {eid: "posInt", oldestMid: "posInt"}

	events.getMoreMessages eid, oldestMid, (err, messages) ->
		if (cb)
			cb err, messages
		else if err
			logError(err)
		else 
			emit()

module.exports = getMoreMessages