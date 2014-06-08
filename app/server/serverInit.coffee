users = require('./users')
async     = require('async')
db     = require('./db.js')
fb = require './fb.js'
events = require './events.js'

handler = 
  connect : require './socketHandlers/connect'
  getMoreMessages : new (require './socketHandlers/GetMoreMessages')
  joinEvent : require './socketHandlers/joinEvent'
  leaveEvent : require './socketHandlers/leaveEvent'
  locationChange : require './socketHandlers/locationChange'
  newEvent : require './socketHandlers/newEvent'
  newInvites : require './socketHandlers/newInvites'
  newMarker : require './socketHandlers/newMarker'
  newMessage : require './socketHandlers/newMessage'
  onAuth : require './socketHandlers/onAuth.js'

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
  #create Joel, Andrew
  (cb) -> handler.onAuth {id: 1380180579, displayName: "Joel Simon"}, "+13475346100", "FBTOKEN", "PHONETOKEN", cb
  (cb) -> handler.onAuth {id: 100000157939878, displayName: "Andrew Sweet"}, "+13107102956", "FBTOKEN", "PHONETOKEN", cb
 ], (err, results) ->
  return console.log("Error in creating users:", err) if err
  [_,joel,andrew] = results
  joelSocket = {handshake:{ user: joel }}
  andrewSocket = {handshake: {user: andrew}}
  async.series [
    #create events
    (cb) -> handler.newEvent { text: "JoelEvent1" }, joelSocket, cb
    (cb) -> handler.newEvent { text: "JoelEvent2" }, joelSocket, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err
      [eid1, eid2] = results;
      console.log eid1, eid2
      async.series [
        #invite andrew to events
        (cb) -> handler.newInvites {eid: eid1, inviteList: [andrew] }, joelSocket, cb
        (cb) -> handler.newInvites {eid: eid2, inviteList: [andrew] }, joelSocket, cb
        #andrew messages event
        (cb) -> handler.newMessage { eid: eid1, text: "newMessage1" }, andrewSocket, cb
        (cb) -> handler.newMessage { eid: eid1, text: "newMessage2" }, andrewSocket, cb
        (cb) -> events.delete(eid2, cb)
        (cb) -> handler.connect {handshake: { user: andrew }}, cb
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