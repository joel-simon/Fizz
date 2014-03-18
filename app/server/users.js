// Abstraction for all database interactions.
var mongojs = require('mongojs');
var config  = require('./../../config.json');
var store = require('./redisStore.js').store;
var io;
var db = mongojs(config.DB.MONGOHQ_UR, ['users', 'events']);
var exports = module.exports;
var async    = require('async');



/*
  REDIS VARIABLES

  users      			| uid -> json user
  fbid->uid 			| fbid -> uid
  pn->uid 				| pn -> uid
	friendList:uid 	| set(uid) 

*/


var blankUser = function(){
	this.uid 			= 0;
	this.type 		= '';
	this.fbid 		= 0;
	this.pn 			= '';
	this.iosToken = '';
	this.fbToken 	= '';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ;
	this.name 		= '';
}

exports.isConnected = function(uid, callback) {
	if(!io) io = require('../../app.js').io;
	return(io.sockets.clients(''+uid).length > 0);
}

////////////////////////////////////////////////////////////////////////////////
//	GET USER
////////////////////////////////////////////////////////////////////////////////
exports.get = function(uid, callback) {
	store.hget('users', uid, function(err, json) {
		if (err) callback(err);
		else if (!json) callback('No user found:'+uid);
		else callback(null, JSON.parse(json));
	});
}
exports.getFromFbid = function(fbid, cb) {
	store.hget('fbid->uid', fbid, function(err, uid) {
		if(err) return cb(err);
		if(!uid) return cb(null, null);
		exports.get(uid, cb);
	});
}
exports.getFromPn = function(pn, cb) {
	store.hget('pn->uid', pn, function(err, uid) {
		if(err)  return cb(err);
		if(!uid) return cb(null, null);
		exports.get(uid, cb);
	});
}

////////////////////////////////////////////////////////////////////////////////
//	ADD USERS
////////////////////////////////////////////////////////////////////////////////
/*
	User has been invited via phone number.
	Return user if already exists.
*/
exports.getOrAddPhone = function(pn, cb) {
	exports.getFromPn(pn, function(err, user){
		if 			(err)  cb(err);
		else if (user) cb(null, user);
		else {
			var user = new blankUser();
			user.pn = pn;
			user.type = "Phone";
			user.name = pn;
			store.hincrby('idCounter', 'user', 1, function(err, next) {
				user.uid = next;
				store.hset('users', user.uid, JSON.stringify(user), function(err) {
					if (err) return logError(err)
					store.hset('pn->uid', user.pn, user.uid);
					cb(err, user);
				});
			});
		}
	});
}

exports.getOrAddPhoneList =  function(pnList, cb) {
	async.map(pnList, getOrAddPhone,
	function(err, userList) {
		if (err) cb (err);
		else cb (null, userList);
	});
}

/*
	User has downloaded the app. 
	Must already exist as a guest or phone user. 
*/
exports.getOrAddMember = function(profile, fbToken, pn, iosToken, cb) {
	exports.getOrAddGuest(profile, fbToken, function(err, user) {
		if (err) return logError(err);
		user.type 		= 'Member'; // upgrade account to member. 
		user.fbid 		= +profile.id;
		user.name     = profile.displayName;
		user.fbToken 	= fbToken;
		user.iosToken = iosToken; 
		update(user, function(err2) {
			if (err2) logError(err2);
			else 			cb(null, user);
		});

	});
}
function update(user, cb) {
	store.hset('users', user.uid, JSON.stringify(user), function(err) {
		if (err) logError(err)
		else 		 cb(err, user);
	});
}

/*
	User has been invited via text and goes to the website. 
	Must already exist as a phone user.
*/
exports.getOrAddGuest = function(profile, fbToken, cb) {
	exports.getFromFbid(+profile.id, function(err, user) {
		if (err)  return cb(err);
		if (user) return cb(null, user);
		 // UPGRADE PHONE USER.
		var pn = (''+Math.random()).split('.')[0]
		exports.getOrAddPhone(pn, function(err, user) {
			store.hset('fbid->uid', +profile.id, user.uid);
			user.fbid = +profile.id;
		 	user.name = profile.displayName;
		 	user.type = 'Guest';
		 	user.fbToken = fbToken;
		 	if (err) cb(err);
		 	else cb(null, user);
		});
		
	});
}


////////////////////////////////////////////////////////////////////////////////
//	
////////////////////////////////////////////////////////////////////////////////



// add user to uids friends list
exports.addFriend = function(user, friendUid, callback) {
	store.sadd('friendList:'+user.uid, friendUid, callback);
}

exports.removeFriend = function(user, friendUid, callback) {
	store.srem('friendList:'+user.uid, friendUid, callback);
}

exports.getFriendIdList = function(uid, cb) {
  store.smembers('friendList:'+uid, function(err, list) {
    if (err) cb(err);
    else cb(null, list);
  });
}

exports.getFriendUserList = function(uid, cb) {
	exports.getFriendIdList(uid, function(err, friendIdList) {
    if (err) return logError(err);
    async.map(friendIdList, exports.get, function(err, friendsList) {
      if (err) {
        cb(err);
      } else {
        cb(null, friendsList);
      }
    });
  });
}

exports.addVisibleList = function(users, eid, cb) {
	async.each(users, function(u, cb2) {
       exports.addVisible(u.uid, eid, cb2);
  }, cb);
}

exports.addVisible = function(uid, eid, callback) {
  store.sadd('viewableBy:'+uid, eid, callback);
}

exports.deleteVisible = function(userId, eid, callback) {
  store.srem('viewableBy:'+userId, eid, callback);
}

  


/*
*	New Player
*/

// exports.getOrAddFromPn = function(pn, callback) {
// 	// users.get
// 	var user = {
// 		fbid : 0,
// 		pn : pn,
// 		name : string 
// 		hasApp : string [ “iPhone” or “” ]
// 		accessToken : string 

// 	}
// 	store.hincrby('idCounter', 'user', 1 , function(err, next) {
// 		user.uid = next;

// 		store.hset('users', user.fbid, JSON.stringify(user), function(err) {
// 			callback(err, user);
// 		});
// 	});
	
// }



// exports.setLocation = function(uid, latlng, callback) {
// 	store.hset('locations', uid, JSON.stringify(latlng), callback);
// }
// exports.getLocation = function(uid, callback) {
// 	store.hget('locations', uid, function(err, json){
// 		if(err) callback(err);
// 		else callback(JSON.stringify(json));
// 	});
// }