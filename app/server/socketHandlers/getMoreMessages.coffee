db = require './../db'
getMoreMessages = (data, socket, cb=(->)) ->
	console.log 'foo'
	eid = data?.eid
	oldestMid = data?.oldestMid
	# check.is data, {eid: "posInt", oldestMid: "posInt"}

	events.getMoreMessages eid, oldestMid, (err, messages) ->
		return (cb err) if err?
		data = {}
		data[eid] = messages
		cb (null, data)

module.exports = getMoreMessages