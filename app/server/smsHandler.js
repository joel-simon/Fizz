var
	handler = require('./socketHandler.js'),
	users     = require('./users.js'),
	utils     = require('./utilities.js'),
  logError  = utils.logError,
	output = require('./output.js');

module.exports = function(from, sms) {
	users.getFromPn(from, function(err, user) {
		if (err) return logError(err)
		users.getUserAndEidFromPn(from, function(err, user, eid) {
			if (err) return logError(err);
			handler.newMessage({eid: eid,text: msg},{handshake:{user:d}});
		});
	});
}

// var 
// 	handler 	= require('./socketHandler.js'),
//   beacons   = require('./Events.js'),
//   output 		= require('./output.js'),
//   utils     = require('./utilities.js'),
//   logError  = utils.logError,
//   log       = utils.log,
//   users     = require('./users.js'),
//   async 		= require('async'),
//   store 		= require('./redisStore.js').store;

// module.exports = function(from, sms) {
// 	console.log(from, sms);
// 	var components = sms.split(':');
// 	if (components.length != 2) return output.sendSms(from, "Invalid string");
// 	var bId = components[0],
// 			msg = components[1];

// 	beacon.isValidId(bId, function(err, idValid) {
// 		if (!isValid) return output.sendSms(from, "Invalid id");
// 		if (msg == 'y' || msg == 'Y') {
// 			output.sendSms(from, "They now know you're interested!");
// 	    beacons.add_guest( bId, from, function(err) {
// 	      if (err) return logError('join beacon', err);
// 	      log(user.name, 'joined beacon', id);
// 	      // emit(host, 'addGuest', {'id':id, 'guest':user.id });  
// 	    })
// 		} else if (msg == 'n' || msg == 'N') {
// 			output.sendSms(from, "They have been told that you can't make it.");
// 		} else {
// 			beacons.addComment(BID, poster, comment, function(err, commentWithId) { 
// 			  data.comment = commentWithId;
// 			  emit(data.host, 'newComment', data);
// 			  log('new comment', data); 
// 			});
// 		}
// 	});
// }

