utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'
db        = require './../adapters/db.js'

module.exports = (socket, callback) ->
  user = utils.getUserSession socket
  q1 = 'UPDATE users
        SET "lastLogin" = getNow()
        WHERE uid = $1 returning "lastLogin"'
  db.query q1, [user.uid], (err, result) ->
    return callback err if err?
    callback null