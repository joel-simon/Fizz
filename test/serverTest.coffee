
async     = require('async')
db     = require('./../app/server/adapters/db.js')
models = require './../app/server/models'
dir = './../app/server/socketHandlers/'

types = require '../app/server/fizzTypes'
check = require 'easy-types'
check.prototype.addTypes(types)
# check.addTypes(types)

postNewEvent   = require dir+'postNewEvent'
postJoinEvent  = require dir+'postJoinEvent'
postLeaveEvent = require dir+'postLeaveEvent'
postNewInvites = require dir+'postNewInvites'
postNewMessage = require dir+'postNewMessage'
connect        = require dir+'connect'
disconnect     = require dir+'disconnect'
postUpdateEvent = require dir+'postUpdateEvent'
postUpdateLocation = require dir+'postUpdateLocation'
postRequestEvents  = require dir+'postRequestEvents'


makeSocket = (user) ->
  {
    join : ()->
    handshake:
      user: user
    emit : () ->
      console.log.apply null, arguments
  }

async.series [
  (cb) -> db.query "truncate table users, events, messages, new_friends, invites", cb
  (cb) -> models.users.create "+13475346100", "Joel Simon", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+13107102956", "Andrew Sweet", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+19494647070", "Antonio Ono", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+3523189733", "Russell Cullen", "ios", "PHONETOKEN", cb
 ], (err, results) ->

  return console.log("Error in creating users:", err) if err?
  
  [_,joel,andrew,antonio,russell] = results

  randomPerson =
    name: 'random'
    pn: '+12123456789'

  joelSocket = makeSocket joel
  andrewSocket = makeSocket andrew
  
  async.series [ #create events
    (cb) -> postNewEvent { text: "JoelEvent1" }, joelSocket, cb
    (cb) -> postNewEvent { text: "AndrewsEvent1" }, andrewSocket, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err?
      [e1, e2] = results;
      async.series [
        (cb) -> postRequestEvents {eid: e1.eid}, joelSocket, cb
        #invite andrew to events
        (cb) -> postNewInvites {eid: e1.eid, inviteList: [andrew, randomPerson] }, joelSocket, cb
        # (cb) -> postNewInvites {eid: e1.eid, inviteList: [antonio, joel] }, andrewSocket, cb

        #andrew messages event
        (cb) -> postNewMessage { eid: e1.eid, text: "andrew says hi" }, andrewSocket, cb
        (cb) -> postNewMessage { eid: e1.eid, text: "joel says hi" }, joelSocket, cb
        # (cb) -> newMessage { eid: e1.eid, text: "newMessage2" }, andrewSocket, cb
        # (cb) -> models.events.delete(e2.eid, cb)
        # (cb) -> suggestInvitedList({eid: e1.eid,})
        (cb) -> connect joelSocket, cb

        (cb) -> postJoinEvent {eid: e1.eid}, andrewSocket, cb
        (cb) -> postLeaveEvent {eid: e1.eid}, andrewSocket, cb
        
        (cb) -> postUpdateEvent {eid: e1.eid, description: 'hi'}, andrewSocket, cb
        (cb) -> postUpdateEvent {eid: e2.eid, description: 'hi'}, andrewSocket, cb
      ], (err, results) ->
        if (err)
          console.log "ERR:", err if err
          process.exit(1)
        else
          console.log "All Done"
          process.exit(0)
        # function(cb){ getMoreMessages({eid:eid, oldestMid:0}, {handshake:{user:joel}}, cb) },
      