class SocketHandler 
  @events   = require('./../events')
  @utils     = require('./../utilities.js')
  @debug     = @utils.debug
  @fb        = require('./../fb.js')
  @users     = require('./../users.js')
  @async     = require('async')
  @output    = require('./../output.js')
  @emit      = @output.emit
  @pushIos   = @output.pushIos
  types = require('./../fizzTypes.js')
  @check = require('easy-types').addTypes(types)
  @dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb'

  constructor: (@name) ->

  getUserSession: (socket) ->
    user = socket?.handshake?.user
    user

module.exports = SocketHandler




#  var
#    io,
#    events   = require('./events.js'),
#    utils     = require('./utilities.js'),
#    logError  = utils.logError,
#    log       = utils.log,
#    debug     = utils.debug,
#    fb        = require('./fb.js'),
#    users     = require('./users.js'),
#    async     = require('async'),
#    output    = require('./output.js'),
#    emit      = output.emit,
#    pushIos   = output.pushIos,
#    exports = module.exports,
#    types = require('./fizzTypes.js'),
#    check = require('easy-types').addTypes(types);


#  var nameShorten = utils.nameShorten;

#  var pg = require('pg');
#  var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

#  var db = require('./db.js');

#  var rollback = function(client, done) {
#    client.query('ROLLBACK', function(err) {
#      return done(err);
#    });
#  };

#  var andrew = {
#    uid: 32,
#    pn: '+13107102956',
#    name: 'Andrew Sweet',
#    last_login: '2014-05-20 17:12:54.2676+00',
#    appUserDetails: {
#      fbid: 100000157939878
#    }
#  }
#  var joel = {
#    uid: 31, 
#    pn:'+13475346100',
#    name: 'Joel Simon',
#    last_login: '2014-05-20 17:12:54.2676+00',
#    appUserDetails: {
#      fbid: 1380180579
#    }
#  }

#  // exports.connect({handshake:{user:joel}});



# // exports.reset = function(socket) {
# //   return;
# // }

# // exports.disconnect = function(socket) {
# //   var self = this, user = getUserSession(socket)
# //   log(nameShorten(user.name)+" has disconnected.")
# // }



# // exports.newServerMessage = function(data) {
# //   check.is(data, {eid: 'posInt', text:'string'});
# //   var eid  = data.eid, text = data.text;
# //   async.parallel({
# //     newMsg: function(cb){ events.addMessage(eid, -1, text, cb) },
# //     e: function(cb) {events.get(eid, cb) }
# //   },
# //   function(err, results) {
# //     var e = results.e;
# //     check.is(e, 'event');
# //     emit({
# //       eventName: 'newMessage',
# //       recipients: results.e.inviteList,
# //       data: {message: results.newMsg}
# //     });
# //   });
# // }