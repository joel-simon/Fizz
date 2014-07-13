utils     = require './../utilities.js'
models 		= require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.exports = (socket, callback) ->
  user = utils.getUserSession socket
  q1 = "UPDATE users
    		SET last_login = (extract(epoch from now())*1000)::bigint
    		WHERE uid = $1"
  db.query q1, [user.uid], (err) ->
    return callback err if err?
    callback null