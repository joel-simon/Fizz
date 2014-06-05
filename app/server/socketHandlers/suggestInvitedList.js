var
  io,
  events   = require('./events.js'),
  utils     = require('./utilities.js'),
  logError  = utils.logError,
  log       = utils.log,
  debug     = utils.debug,
  fb        = require('./fb.js'),
  users     = require('./users.js'),
  async     = require('async'),
  output    = require('./output.js'),
  emit      = output.emit,
  pushIos   = output.pushIos,
  exports = module.exports,
  types = require('./../fizzTypes.js'),
  check = require('easy-types').addTypes(types);

function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}
module.exports = function(data, socket) {
  console.log('suggestInvitedList data:', data);
  check.is(data, { eid: 'posInt', inviteList: '[user]'});
  var eid = data.eid, inviteList = data.inviteList;
  var q1 = "SELECT (uid, fbid, name, token, platform) FROM users, events WHERE "+
           "events.creator = users.uid AND events.eid = $1";
  db.query(q1, [eid], function(err, result) {
    var creator = JSON.parse(result.rows[0].rows);
    console.log(creator);
    //TODO  make this a user object.
    events.addInvites(eid, inviteList, false, function(){
      if (err) return logError(err);
      // console.log(result);
      var data = {};
      data[eid] = [inviteList];
      emit({ 
        eventName: 'newSuggestedInvites',
        data: data,
        recipients: newInvites
      });
    });
  });
}