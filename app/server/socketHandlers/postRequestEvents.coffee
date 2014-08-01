async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  utils.log 'Recieved requestEvents', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  # console.trace()
  callback null