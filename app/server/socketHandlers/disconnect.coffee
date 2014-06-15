events   = require('./../events')
utils     = require('./../utilities.js')
users     = require('./../users.js')
async     = require('async')
output    = require('./../output.js')
emit      = output.emit
db = require './../db.js'

module.exports = (socket) ->
  user = utils.getUserSession(socket)
  q1 = "UPDATE users
    SET last_login = (extract(epoch from now())*1000)::bigint
    WHERE uid = $1"
  db.query q1, [user.uid], (err) ->
    if err
      console.log 'Err updating lastLogin:',err
    else
      console.log 'Updated last login successfully.'