SocketHandler = require './SocketHandler'

class GetMoreMessages extends SocketHandler
  handle : (data, socket, cb=(->)) ->
    eid = data?.eid
    oldestMid = data?.oldestMid
    check.is data, {eid: "posInt", oldestMid: "posInt"}

    events.getMoreMessages eid, oldestMid, (err, messages) ->
      data = {}
      data[eid] = messages
      cb (null, data)

module.exports = GetMoreMessages