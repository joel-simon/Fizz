
async     = require('async')
db     = require('./../app/server/adapters/db.js')
models = require './../app/server/models'


dir = './../app/server/socketHandlers/'

postNewEvent   = require dir+'postNewEvent'
postJoinEvent  = require dir+'postJoinEvent'
postLeaveEvent = require dir+'postLeaveEvent'
postNewInvites = require dir+'postNewInvites'
postNewMessage = require dir+'postNewMessage'
connect     = require dir+'connect'
disconnect     = require dir+'disconnect'
postUpdateLocation = require(dir+'postUpdateLocation')
postRequestEvents  = require dir+'postRequestEvents'

async.series [
  (cb) -> db.query "truncate table users, events, messages, new_friends, invites", cb
  (cb) -> models.users.create "+13475346100", "Joel Simon", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+13107102956", "Andrew Sweet", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+19494647070", "Antonio Ono", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+3523189733", "Russell Cullen", "ios", "PHONETOKEN", cb
 ], (err, results) ->

  return console.log("Error in creating users:", err) if err?
  
  [_,joel,andrew,antonio,russell] = results
  console.log joel
  joelSocket = {handshake:{ user: joel }}
  andrewSocket = {handshake: {user: andrew}}
  
  async.series [ #create events
    (cb) -> postNewEvent { text: "JoelEvent1" }, joelSocket, cb
    (cb) -> postNewEvent { text: "AndrewsEvent1" }, andrewSocket, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err?
      [e1, e2] = results;
      async.series [
        #invite andrew to events
        (cb) -> postNewInvites {eid: e1.eid, inviteList: [andrew] }, joelSocket, cb
        (cb) -> postNewInvites {eid: e1.eid, inviteList: [antonio] }, andrewSocket, cb
        (cb) -> postNewInvites {eid: e2.eid, inviteList: [joel] }, andrewSocket, cb
        #andrew messages event
        # (cb) -> newMessage { eid: e1.eid, text: "newMessage1" }, andrewSocket, cb
        # (cb) -> newMessage { eid: e1.eid, text: "newMessage2" }, andrewSocket, cb
        # (cb) -> models.events.delete(e2.eid, cb)
        # (cb) -> suggestInvitedList({eid: e1.eid,})
        (cb) -> connect joelSocket, cb

        # (cb) -> joinEvent {eid:eid},{handshake: { user: andrew }}, cb
        # (cb) -> leaveEvent {eid:eid},{handshake: { user: andrew }}, cb
        # (cb) -> users.get(joel.uid, cb)
        # (cb) -> users.getFromPn(joel.pn, cb)
      ],
      (err, results) ->
        if (err)
          console.log "ERR:", err if err
          process.exit(1)
        else
          console.log "All Done"
          process.exit(0)
        # function(cb){ getMoreMessages({eid:eid, oldestMid:0}, {handshake:{user:joel}}, cb) },
      