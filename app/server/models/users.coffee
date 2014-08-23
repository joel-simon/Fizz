utils   = require './../utilities.js'
async   = require 'async'

exports = module.exports;

output  = require './../output.js'
emit    = output.emit

#  pg = require('pg');
db = require('./../adapters/db.js');
#  dbstring = db.connString;

exports.parse = (data) ->
  return null if not data?
  {
    uid: parseInt data.uid
    pn: data.pn
    name: data.name
  }

exports.isConnected = (uid, callback) ->
  io = require('../../app.js').io
  io.sockets.clients(''+uid).length > 0

########################################
# GET USER
########################################
exports.get = (uid, cb) ->
  q1 = "select * from users where uid = $1"
  db.query q1, [uid], (err, result) ->
    return cb err if err?
    cb null, exports.parse result.rows[0]

exports.getTokens = (uidList, cb) ->
  q1 = "select uid, phone_token from users where uid = ANY($1::int[])"
  db.query q1, [uid], (err, result) ->
    cb err if err?
    else cb null, result.rows

exports.getFromPn = (pn, cb) ->
  q1 = "select * from users where pn = $1"
  db.query q1, [uid], (err, result) ->
    return cb err if err?
    cb null, exports.parse result.rows[0]

########################################
# GETTING/CREATING/MODIFYING USERS
########################################

exports.create = (pn, name, platform, token, callback) ->
  password = generatePassword()
  q1 = "INSERT INTO users (pn, name, platform, phone_token, password) VALUES ($1,$2,$3,$4,$5) RETURNING *"
  values = [pn, name, platform, token, password]
  db.query q1, values, (err, result) ->
    return callback err if err?
    user = exports.parse result.rows[0]
    callback null, user, password

exports.getOrAddList = (namePnList, callback) ->
  async.map namePnList, ((namePn, cb) -> getOrAdd namePn.pn, namePn.name, cb ),
    callback

#User has been invited via phone number.
# Return user if already exists.
getOrAdd = (pn, name, cb) ->
  pn = utils.formatPn pn
  exports.getFromPn pn, (err, user) ->
    if err
      cb err
    else if user
      cb null, user
    else
      exports.create pn, name, 'sms', '', cb

generatePassword = () ->
  text = ""
  possible = "0123456789"
  for i in [0..5] by 1
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  text