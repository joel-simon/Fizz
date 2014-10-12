utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output'
db        = require './../adapters/db.js'

module.exports = (socket, callback) ->
  user = utils.getUserSession socket
  # if not user?
  # 	return callback 'socket=',socket
  
  q1 = 'UPDATE users
        SET "lastLogin" = (extract(epoch from now())*1000)::bigint
        WHERE uid = $1 returning "lastLogin"'
  db.query q1, [user.uid], (err, result) ->
    return callback err if err?
    callback null