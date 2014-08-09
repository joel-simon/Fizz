async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'
check     = require('easy-types')
# types = require('./../fizzTypes.js')
# check = require('easy-types').addTypes(types)

module.exports = (data, socket, callback) ->
  eventName = 'newInvites'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)

  eid = data.eid
  namePnList = data.inviteList

  check(eid).is('posInt')

  # Get all user objects and make new user objects.
  models.users.getOrAddList namePnList, (err, newlyInvitedUsers) ->
    return callback err if err?

    # Get the users who are already invited.
    models.events.getInviteList eid, (err, oldInvitedUsers) ->
      return callback err if err?

      # make them invited.
      models.events.addInvites eid, user.uid, newlyInvitedUsers, true, (err) ->
        return callback err if err?

        # Get the event Object.
        models.events.getFull eid, (err, event, messages, inviteList, guests) ->
          return callback err if err?
          creator      = event.creator
          description  = event.description
          creationTime = event.creationTime


          newlyInvitedSMSUsers = inviteList.filter (user) -> user.platform == 'sms'
          newlyInvitedNotSMSUsers = inviteList.filter (user) -> user.platform != 'sms'

          # Let the old users know about the new ones.
          output.emit {
            eventName
            recipients : oldInvitedUsers
            data : { eid, inviteList }
          }

          # console.log 'inviteList:', inviteList
          
          # console.log 'newlyInvitedSMSUsers: ', newlyInvitedSMSUsers
          # console.log 'newlyInvitedNotSMSUsers:', newlyInvitedNotSMSUsers
          
          # Let the new users know about the event.
          output.emit {
            eventName  : 'newEvent'
            recipients : newlyInvitedNotSMSUsers
            data : { eid, creator, description, creationTime
                     messages, inviteList, guests }
          }


          newlyInvitedSMSUsers.forEach (smsUser) ->
            message = 'Click this link: extraFizzy.com/e/'+event.eid
            output.sendSms message, smsUser 

          callback null, inviteList
