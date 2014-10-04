utils   = require './../utilities.js'
async   = require 'async'
exports = module.exports;
db = require('./../adapters/db.js');
_ = require 'underscore'

exports.get = (where, fields, cb) ->
  if not cb
    cb = fields
    fields = ['uid', 'pn', 'name', 'platform']
  column = _.keys(where)[0]
  value = where[column]
  q1 = "select #{fields} from users where \"#{column}\" = $1"
  db.query q1, [value], (err, result) ->
    return cb err if err?
    cb null, result.rows[0]

exports.verify = (options, cb) ->
  column = _.keys(options)[0]
  value = options[column]
  q1 = "UPDATE users SET verified = true where \"#{column}\" = $1"
  db.query q1, [value], (err, result) ->
    return cb err if err?
    cb null

exports.isVerified = (options, cb) ->
  column = _.keys(options)[0]
  value = options[column]
  q1 = "select verified from users where \"#{column}\" = $1"
  db.query q1, [value], (err, result) ->
    return cb err if err?
    cb null, result.rows[0]?.verified

exports.getFull = (options, cb) ->
  column = _.keys(options)[0]
  value = options[column]
  q1 = "select * from users where \"#{column}\" = $1"
  db.query q1, [value], (err, result) ->
    return cb err if err?
    data = result.rows[0]
    if data.uid
      cb null, _.pick(data,'uid', 'name','pn'), data
    else
      cb null, null, null

# exports.getAll = (columns, uidList, cb) ->
#   q1 = "select uid, phone_token from users where uid = ANY($1::int[])"
#   db.query q1, [uid], (err, result) ->
#     cb err if err?
#     else cb null, result.rows

########################################
# GETTING/CREATING/MODIFYING USERS
########################################

exports.create = (pn, name, platform, token, callback) ->
  password = generatePassword()
  q1 = "INSERT INTO users (pn, name, platform, \"phoneToken\", password) VALUES ($1,$2,$3,$4,$5) RETURNING uid, pn, name"
  values = [pn, name, platform, token, password]
  db.query q1, values, (err, result) ->
    return callback err if err?
    user = result.rows[0]
    callback null, user, password

exports.getOrAddList = (namePnList, callback) ->
  async.map namePnList, getOrAdd, callback

exports.newPassword = (options, callback) ->
  column = _.keys(options)[0]
  value = options[column]
  password = generatePassword()
  q = "UPDATE users SET password = $1 WHERE \"#{column}\" = $2 RETURNING *"
  db.query q, [password, value], (err, result) ->
    return callback err if err?
    user = result.rows[0]
    callback null, user, result.rows[0].password
#User has been invited via phone number.
# Return user if already exists.
getOrAdd = ({ pn, name }, cb) ->
  pn = utils.formatPn pn
  exports.get {pn}, (err, user) ->
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