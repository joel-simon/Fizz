async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  user = utils.getUserSession socket
  utils.log 'updateEvent', "User:"+ JSON.stringify(user), "Data:"+ JSON.stringify(data)
  callback null