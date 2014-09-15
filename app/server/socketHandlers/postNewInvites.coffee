async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'
_ = require 'underscore'

module.exports = (data, socket, callback) ->
  eventName = 'newInvites'
  user = utils.getUserSession socket
  console.log user
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)

  eid = data.eid
  namePnList = data.inviteList

  # Get all user objects and make new user objects.
  models.users.getOrAddList namePnList, (err, newlyInvitedUsers) ->
    return callback err if err?

    # Get the users who are already invited.
    models.events.getInviteList eid, (err, oldInvitedUsers) ->
      return callback err if err?

      # make them invited.
      models.invites.addList eid, user.uid, newlyInvitedUsers, (err, keyMapping) ->

        return callback err if err?
        # Get the event Object.
        models.events.getFull eid, (err, event, messages, inviteList, guests) ->
          return callback err if err?
          { creator, description, creationTime } = event

          [newlyInvitedSMSUsers, newlyInvitedNotSMSUsers] = _.partition inviteList, (u)-> u.platform == 'sms'

          # Let the old users know about the new ones.
          output.emit {
            eventName
            recipients : oldInvitedUsers
            data : { eid, inviteList }
          }

          output.emit {
            eventName  : 'newEvent'
            recipients : newlyInvitedNotSMSUsers
            data : { eid, creator, description, creationTime
                     messages, inviteList, guests }
          }

          newlyInvitedSMSUsers.forEach (smsUser) ->
            url = 'http://54.86.103.35:9001/e/'
            # url = 'extraFizzy.com/e/'
            message = "Invited to a fizz event: #{url}#{keyMapping[smsUser.uid]}"
            output.sendSms message, smsUser 

          callback null, inviteList
