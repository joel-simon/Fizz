async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
_ = require 'underscore'

without = (a, b) ->
  a = _.map a, JSON.stringify
  b = _.map b, JSON.stringify
  _.map _.difference(a,b), JSON.parse

formatInviteList = (invL = []) ->
  for namePn in invL
    namePn.pn = utils.formatPn namePn.pn
  _.uniq invL, (item)-> item.pn
  

module.exports = (data, socket, output, callback) ->
  user = utils.getUserSession socket
  utils.log "Recieved newInvites",
            "User:#{JSON.stringify(user)}",
            "Data:#{JSON.stringify(data)}"

  eid = data.eid
  namePnList = formatInviteList data.inviteList

  # Get the users who are already invited.
  models.events.getInviteList eid, (err, oldInvitedUsers) ->
    return callback err if err?
    # Get all user objects and make new user objects.
    models.users.getOrAddList namePnList, (err, newlyInvitedUsers) ->
      return callback err if err?
      newlyInvitedUsers = without newlyInvitedUsers, oldInvitedUsers
      return callback null, null if newlyInvitedUsers.length is 0
      # newlyInvitedUsers.map(JSON.stringify)
      # newlyInvitedUsers = _.difference newlyInvitedUsers, oldInvitedUsers
      # make them invited.
      models.invites.addList eid, user.uid, newlyInvitedUsers, (err, keyMapping) ->
        return callback err if err?
        # Get the event Object.
        models.events.getFull eid, (err, event, messages, inviteList, guests) ->
          return callback err if err?
          { creator, description, creationTime } = event
          [newlyInvitedSMSUsers, newlyInvitedNotSMSUsers] = _.partition newlyInvitedUsers, (u)-> u.platform == 'sms'
          # Let the old users know about the new ones.
          
          output.emit {
            eventName : 'newInvitees'
            recipients : oldInvitedUsers
            data : { eid, newlyInvitedUsers}
          }

          output.push { 
            eid
            recipients : newlyInvitedNotSMSUsers
            msg : user.name+' has invited you to an event!'
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
