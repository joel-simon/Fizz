
async     = require('async')
db     = require('./../app/server/adapters/db.js')
models = require './../app/server/models'
fb = require './../app/server/adapters/fb.js'


handler = 
  connect : require './../app/server/socketHandlers/connect'
  getMoreMessages : require './../app/server/socketHandlers/GetMoreMessages'
  joinEvent : require './../app/server/socketHandlers/joinEvent'
  leaveEvent : require './../app/server/socketHandlers/leaveEvent'
  locationChange : require './../app/server/socketHandlers/locationChange'
  newEvent : require './../app/server/socketHandlers/newEvent'
  newInvites : require './../app/server/socketHandlers/newInvites'
  newMarker : require './../app/server/socketHandlers/newMarker'
  newMessage : require './../app/server/socketHandlers/newMessage'
  onAuth : require './../app/server/socketHandlers/onAuth'

async.series [
  (cb) -> db.query "truncate table users, events, messages, new_friends, invites", cb
  (cb) -> handler.onAuth {id: 1380180579, displayName: "Joel Simon"}, "+13475346100", "FBTOKEN", "PHONETOKEN", cb
  (cb) -> handler.onAuth {id: 100000157939878, displayName: "Andrew Sweet"}, "+13107102956", "FBTOKEN", "PHONETOKEN", cb
  (cb) -> handler.onAuth {id: 1234567980, displayName: "Antonio Ono"}, "+19494647070", "FBTOKEN", "PHONETOKEN", cb
  (cb) -> handler.onAuth {id: 987654321, displayName: "Russell Cullen"}, "+3523189733", "FBTOKEN", "PHONETOKEN", cb
 ], (err, results) ->
  return console.log("Error in creating users:", err) if err?
  
  [_,joel,andrew,antonio,russell] = results
  joelSocket = {handshake:{ user: joel }}
  andrewSocket = {handshake: {user: andrew}}
  
  async.series [ #create events
    (cb) -> handler.newEvent { text: "JoelEvent1" }, joelSocket, cb
    (cb) -> handler.newEvent { text: "AndrewsEvent1" }, andrewSocket, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err?
      [e1, e2] = results;
      async.series [
        #invite andrew to events
        (cb) -> handler.newInvites {eid: e1.eid, inviteList: [andrew] }, joelSocket, cb
        (cb) -> handler.newInvites {eid: e1.eid, inviteList: [antonio] }, andrewSocket, cb
        (cb) -> handler.newInvites {eid: e2.eid, inviteList: [joel] }, andrewSocket, cb
        #andrew messages event
        (cb) -> handler.newMessage { eid: e1.eid, text: "newMessage1" }, andrewSocket, cb
        (cb) -> handler.newMessage { eid: e1.eid, text: "newMessage2" }, andrewSocket, cb
        (cb) -> models.events.delete(e2.eid, cb)
        # (cb) -> handler.suggestInvitedList({eid: e1.eid,})
        (cb) -> handler.connect joelSocket, cb

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
      