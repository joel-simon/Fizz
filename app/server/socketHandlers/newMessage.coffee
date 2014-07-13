async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (data, socket, callback) ->
  utils.log 'newMessage', data
  # check.is(data, {eid: 'posInt', text:'string'});
  user = utils.getUserSession socket
  eid  = data.eid
  text = data.text

  async.parallel {
    newMsg : (cb) ->
      models.events.addMessage eid, user.uid, text, cb
    inviteList: (cb) ->
      models.events.getInviteList eid, cb
  },
  (err, results) ->
    msg = results.newMsg
    inviteList = results.inviteList
    return callback err if err?
    
    emitBody = 
      eventName: 'newMessage'
      recipients: inviteList
      data:
        eid: eid
        messages: [msg]
    output.emit emitBody
    callback null
    # pushIos({
    #   msg: nameShorten(user.name)+': '+text,
    #   eid: eid,
    #   userList: inviteLists
    # });