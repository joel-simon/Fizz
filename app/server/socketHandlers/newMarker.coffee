async     = require 'async'
utils     = require './../utilities.js'
models    = require './../models'
output    = require './../output.js'
db        = require './../adapters/db.js'

module.export = (data, socket, callback) ->
  utils.log 'newMarker', data
  callback null
  # check.is(data, {eid: 'posInt', latlng: 'latlng'});