async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'


module.exports = (data, socket, callback) ->
  utils.log 'updateEvent', data
  callback null