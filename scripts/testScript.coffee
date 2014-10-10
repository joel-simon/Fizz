utils = require './../app/server/utilities'
async     = require('async')
db     = require('./../app/server/adapters/db.js')
models = require './../app/server/models'
dir = './../app/server/socketHandlers/'

io = {sockets:{'in': (uid) -> {emit:(eventName, data)-> 'console.log "Emitting #{eventName} to #{uid}"'} }}
output = require('./../app/server/output')(io)
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
postCompleteEvent = require dir+'postCompleteEvent'

makeSocket = (user) ->
  {
    join : ()->
    handshake:
      user: user
    emit : () ->
      # utils.log 'Emitting '+ arguments[0], ' data :'+JSON.stringify arguments[1]
      # console.log.apply null, arguments
  }

async.series [
  (cb) -> db.query "truncate table users, events, messages, invites", cb
  (cb) -> models.users.create "+13475346100", "Joel Simon", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+13107102956", "Andrew Sweet", "ios", "PHONETOKEN", cb
  (cb) -> models.users.create "+19494647070", "Antonio Ono", "sms", "PHONETOKEN", cb
  (cb) -> models.users.create "+13523189733", "Russell Cullen", "ios", "PHONETOKEN", cb
 ], (err, results) ->

  return console.log("Error in creating users:", err) if err?
  
  [_,[joel,_ ], [andrew, _], [antonio, _],[russell,_]] = results

  randomPerson =
    name: 'random'
    pn: '+13475346100'

  joelSocket = makeSocket joel
  andrewSocket = makeSocket andrew

  async.series [ #create events
    (cb) -> postNewEvent { description: "JoelEvent1" }, joelSocket, output, cb
    (cb) -> postNewEvent { description: "AndrewsEvent1" }, andrewSocket, output, cb
    ], (err, results) ->
      return console.log("Error in creating events:", err) if err?
      [e1, e2] = results;
      async.series [
        # (cb) -> postRequestEvents {eid: e1.eid}, joelSocket, cb
        #invite andrew to events
        (cb) -> postNewInvites {eid: e1.eid, inviteList: [andrew, antonio, russell] }, joelSocket, output,cb
        # (cb) -> postUpdateLocation {location: { lat: 3.14, lng: 1.14 }}, joelSocket, output, cb
        (cb) -> postNewInvites {eid: e2.eid, inviteList: [antonio, joel] }, andrewSocket, output, cb

        (cb) -> postJoinEvent {eid: e1.eid}, andrewSocket, output, cb
        #andrew messages event
        (cb) -> postNewMessage { eid: e1.eid, text: "andrew says hi" }, andrewSocket, output, cb
        (cb) -> postNewMessage { eid: e1.eid, text: "joel says hi" }, joelSocket, output, cb
        # (cb) -> postNewMessage { eid: e2.eid, text: "joel says here also" }, joelSocket, output, cb


        # (cb) -> models.events.delete(e2.eid, cb)

        
        (cb) -> postCompleteEvent { eid: e2.eid, completed: true }, andrewSocket, output, cb
        (cb) -> connect joelSocket, cb
        (cb) -> disconnect joelSocket, cb
        (cb) -> postCompleteEvent { eid: e2.eid, completed: false }, andrewSocket, output, cb
        (cb) -> connect joelSocket, cb
        (cb) -> disconnect joelSocket, cb
        # (cb) -> postRequestEvents {eidList: [e1.eid, e2.eid]}, joelSocket, output, cb
        
        # (cb) -> postLeaveEvent {eid: e1.eid}, andrewSocket, output, cb
        
        # (cb) -> postUpdateEvent {eid: e1.eid, description: 'Test Event'}, andrewSocket, cb
        # (cb) -> postUpdateEvent {eid: e2.eid, description: 'Test Event'}, andrewSocket, cb

        # (cb) -> postCompleteEvent { eid: e1.eid }, andrewSocket, cb
        # (cb) -> postCompleteEvent { eid: e2.eid }, andrewSocket, cb

      ], (err, results) ->
        if (err)
          console.log "ERR:", err if err
          # process.exit(1)
        else
          console.log "All Done"
          # process.exit(0)