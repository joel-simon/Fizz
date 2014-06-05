
async     = require('async')
db     = require('./db.js')
fb = require './fb.js'

handler = 
  connect : require './socketHandlers/connect'
  getMoreMessages : new (require './socketHandlers/GetMoreMessages')
  joinEvent : require './socketHandlers/joinEvent'
  leaveEvent : require './socketHandlers/leaveEvent'
  locationChange : require './socketHandlers/locationChange'
  newEvent : new (require './socketHandlers/newEvent')
  newInvites : require './socketHandlers/newInvites'
  newMarker : require './socketHandlers/newMarker'
  newMessage : require './socketHandlers/newMessage'
  onAuth : require './socketHandlers/onAuth.js'

console.log handler.joinEvent, handler.leaveEvent
# var joel =  {
#   uid: 58,
#   pn: '+13475346100',
#   name: 'Joel Simon',
#   appUserDetails: {  
#     fbid: 1380180579,
#     lastLogin: 'Mon May 26 2014 14:56:14 GMT-0700 (PDT)'
#   }
# }
# var andrew = {
#   uid: 59,
#   pn: '+13107102956',
#   name: 'Andrew Sweet',
#   appUserDetails: {
#     fbid: 100000157939878,
#     lastLogin: 'Mon May 26 2014 14:56:14 GMT-0700 (PDT)'
#   }
# }

async.series [
  (cb) -> db.query "truncate table users, events, messages, new_friends, invites", cb
  (cb) -> handler.onAuth {id: 1380180579, displayName: "Joel Simon"}, "+13475346100", "FBTOKEN", "PHONETOKEN", cb
  (cb) -> handler.onAuth {id: 100000157939878, displayName: "Andrew Sweet"}, "+13107102956", "FBTOKEN", "PHONETOKEN", cb

 ], (err, results) ->
  return console.log("ERR:", err) if err
  [_,joel,andrew] = results
  handler.newEvent.handle {text: "myEvent"}, handshake:{user: joel}, (err, eid) ->
    async.series [
      (cb) -> handler.newInvites {eid: eid, inviteList: [andrew] } , {handshake: { user: joel }} , cb
      (cb) -> handler.newMessage { eid: eid, text: "newMessage" }, {handshake: {user: joel}}, cb
      (cb) -> handler.connect {handshake: { user: andrew }}, cb
      (cb) -> handler.joinEvent {eid:eid},{handshake: { user: andrew }}, cb
      (cb) -> handler.leaveEvent {eid:eid},{handshake: { user: andrew }}, cb
    ],
    (err) ->
      return console.log "ERR:", err if err
      console.log "All Done"
      # function(cb){ handler.getMoreMessages({eid:eid, oldestMid:0}, {handshake:{user:joel}}, cb) },