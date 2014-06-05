var
  events   = require('./../events.js'),
  utils     = require('./../utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./../fb.js'),
  users     = require('./../users.js'),
  async     = require('async'),
  output    = require('./../output.js'),
  emit      = output.emit,
  pushIos   = output.pushIos,
  exports = module.exports,
  types = require('./../fizzTypes.js'),
  check = require('easy-types').addTypes(types);
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

function getUserSession(socket) {
  var user = socket.handshake.user;
  // check.is(user, 'user');
  return user;
}
exports.newMarker = function(data, socket) {
  console.log('newMarker: data', data);
  check.is(data, {eid: 'posInt', latlng: 'latlng'});
  return;
}