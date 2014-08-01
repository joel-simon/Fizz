async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

# types = require('./../fizzTypes.js')
# check = require('easy-types').addTypes(types)

module.exports = (data, socket, callback) ->
  eventName = 'newInvites'
  user = utils.getUserSession socket
  utils.log 'Recieved '+eventName, "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)

  eid = data.eid
  deltaInviteList = data.inviteList

  models.events.getInviteList eid, (err, oldInviteList) ->
    return callback err if err?
    models.events.addInvites eid, user.uid, deltaInviteList, true, (err) ->
      return callback err if err?
      models.events.getFull eid, (err, event, messages, inviteList, guests) ->
        return callback err if err?
        creator =  event.creator
        description =  event.description
        creationTime = event.creationTime

        output.emit {
          eventName
          recipients : oldInviteList
          data : { eid, inviteList }
        }

        output.emit {
          eventName  : 'newEvent'
          recipients : deltaInviteList
          data : { eid, creator, description, creationTime
                   messages, inviteList, guests }
        }
        callback null, inviteList
