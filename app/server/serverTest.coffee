users = require('./users')
async     = require('async')
db     = require('./db.js')
fb = require './fb.js'
events = require './events'

handler = 
  connect : require './socketHandlers/connect'
  getMoreMessages : require './socketHandlers/GetMoreMessages'
  joinEvent : require './socketHandlers/joinEvent'
  leaveEvent : require './socketHandlers/leaveEvent'
  locationChange : require './socketHandlers/locationChange'
  newEvent : require './socketHandlers/newEvent'
  newInvites : require './socketHandlers/newInvites'
  newMarker : require './socketHandlers/newMarker'
  newMessage : require './socketHandlers/newMessage'
  onAuth : require './socketHandlers/onAuth.js'

async.series [
  (cb) -> cb(null)
  (cb) -> db.query "truncate table users, events, messages, new_friends, invites", cb
  # (cb) -> handler.onAuth {id: 1380180579, displayName: "Joel Simon"}, "+13475346100", "FBTOKEN", "PHONETOKEN", cb
  # (cb) -> handler.onAuth {id: 100000157939878, displayName: "Andrew Sweet"}, "+13107102956", "FBTOKEN", "PHONETOKEN", cb
  # (cb) -> handler.onAuth {id: 1234567980, displayName: "Antonio Ono"}, "+19494647070", "FBTOKEN", "PHONETOKEN", cb
  # (cb) -> handler.onAuth {id: 987654321, displayName: "Russell Cullen"}, "+3523189733", "FBTOKEN", "PHONETOKEN", cb
 ], (err, results) ->
  return console.log("Error in creating users:", err) if err
  [_,joel,andrew,antonio,russell] = results
  joelSocket = {handshake:{ user: joel }}
  andrewSocket = {handshake: {user: andrew}}
  async.series [
    (cb) -> cb(null)
    #create events
    # (cb) -> handler.newEvent { text: "JoelEvent1" }, joelSocket, cb
    # (cb) -> handler.newEvent { text: "AndrewsEvent1" }, andrewSocket, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err
      [eid1, eid2] = results;
      async.series [
        #invite andrew to events
        # (cb) -> handler.newInvites {eid: eid1, inviteList: [andrew] }, joelSocket, cb
        # (cb) -> handler.newInvites {eid: eid1, inviteList: [antonio] }, andrewSocket, cb
        # (cb) -> handler.newInvites {eid: eid2, inviteList: [joel] }, andrewSocket, cb
        #andrew messages event
        # (cb) -> handler.newMessage { eid: eid1, text: "newMessage1" }, andrewSocket, cb
        # (cb) -> handler.newMessage { eid: eid1, text: "newMessage2" }, andrewSocket, cb
        # (cb) -> events.delete(eid2, cb)
        # (cb) -> handler.suggestInvitedList({eid: eid1,})
        # (cb) -> handler.connect joelSocket, cb

        # (cb) -> handler.joinEvent {eid:eid},{handshake: { user: andrew }}, cb
        # (cb) -> handler.leaveEvent {eid:eid},{handshake: { user: andrew }}, cb
        # (cb) -> users.get(joel.uid, cb)
        # (cb) -> users.getFromFbid(joel.appUserDetails.fbid, cb)
        # (cb) -> users.getFromPn(joel.pn, cb)
      ],
      (err, results) ->
        return console.log "ERR:", err if err
        console.log "All Done"
        # function(cb){ handler.getMoreMessages({eid:eid, oldestMid:0}, {handshake:{user:joel}}, cb) },
      