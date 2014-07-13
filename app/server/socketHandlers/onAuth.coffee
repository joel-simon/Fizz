fb = require('./../adapters/fb.js')
models = require('./../models')
db = require('./../adapters/db')

#Handle a socket connection.
module.exports = (profile, pn, fbToken, phoneToken, cb) ->
  fb.extendToken fbToken, (err, longToken) ->
    return cb err if err
    models.users.getOrAddMember profile, fbToken, pn, 'ios', phoneToken, (err, user) ->
      return cb err if err?
      cb null, user