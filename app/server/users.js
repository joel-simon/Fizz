// Abstraction for all database interactions.
var mongojs = require('mongojs');
var config  = require('./../../config.json');
var store   = require('./redisStore.js').store;
var utils   = require('./utilities.js');
var log     = utils.log;
var db      = mongojs(config.DB.MONGOHQ_UR, ['users', 'events']);
var exports = module.exports;
var async   = require('async');
var fb      = require('./fb.js');
var db      = require('./dynamo.js');
var io;
/*
  REDIS VARIABLES
  fbid->uid 			| fbid -> uid
  pn->uid 				| pn -> uid
*/
exports.isConnected = function(uid, callback) {
	if(!io) io = require('../../app.js').io;
	return(io.sockets.clients(''+uid).length > 0);
}

////////////////////////////////////////////////////////////////////////////////
//	GET USER
////////////////////////////////////////////////////////////////////////////////
function getAttributes(uid, attributes, cb) {
	db.getItem({
		TableName : 'users',
		Key : {'uid' : {'N' : uid} },
		AttributesToGet : attributes
	},
	function(err, data){
		if (err) cb (err);
		else cb (null, data.Item);
	});
}
exports.get = function(uid, cb) {
	getAttributes(''+uid, ['type', 'fbid', 'pn', 'name'], function(err, data) {
		if (err) cb(err);
		else if (!data) cb(null, null);
		else {
			cb(null, {
				uid  : uid,
				name : data.name.S,
				pn   : data.pn.S,
				type : data.type.S,
				fbid : +data.fbid.N
			});
		}
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
//	GETTING/CREATING/MODIFYING USERS
////////////////////////////////////////////////////////////////////////////////
function set(uid, user, cb) {
	var item = {
		uid  : {'N'  : ''+uid},
		pn   : {'S'  : user.pn},
		fbid : {'N'  : ''+user.fbid},
		name : {'S'  : user.name},
		type : {'S'  : user.type}
		// friendList: {'NS' : []}
	}
	db.putItem({
		'TableName': 'users',
		'Item': item
	}, function(err, data) {
		if (err) {
			cb (err);
		} else {
			cb (null, user);
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
	var fbid = +profile.id;
	exports.getFromFbid(+profile.id, function(err, user) {
		if (err) {
			cb(err);
		} else if (user && user.type === 'Member') {
			cb(null, user);
		} else if (user && user.type === 'Guest') {
			user.type = 'Member';
			user.iosToken = iosToken;
			log('Upgrading', user.name, 'from Guest to Member.');
			set(user.uid, user, cb);
		} else { // see if a phone user exists. 
			exports.getFromPn(pn, function(err, user) {
				if (err) return cb(err);
				if (user && user.type === 'Phone') {
					user.type = 'Member';
					user.iosToken = iosToken;
					user.fbid = fbid;
					user.name = profile.displayName;
					log('Upgrading', user.name, 'from Phone to Member.');
					set(user.uid, user, cb);
				} else { // create a new user from scratch.
					blankUser(pn, fbid, function(err, user) {
						if (err) return cb(err);
						user.pn = pn;
						user.type = "Member";
						user.name = profile.displayName;
						user.fbid = fbid;
						log('Creating', user.name, 'as Member.');
						set(user.uid, user, cb);
					});
				}
			});
		}
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
		exports.getOrAddPhone(pn, function(err, user) {
			if (err) return cb(err);
			store.hset('fbid->uid', +profile.id, user.uid);
			user.fbid = +profile.id;
		 	user.name = profile.displayName;
		 	user.type = 'Guest';
		 	user.fbToken = fbToken;
		 	d(user, function(err2) {
				if (err2) return cb(err2);
				cb(null, user);
			});
		});
		
	});
}
/*
	User has been invited via phone number.
	Return user if already exists.
*/
exports.getOrAddPhone = function(pn, cb) {
	exports.getFromPn(pn, function(err, user) {
		if 			(err)  cb(err);
		else if (user) cb(null, user);
		else {
			blankUser(pn, null, function(err, user) {
				if (err) return cb(err);
				user.pn = pn;
				user.type = "Phone";
				user.name = pn;
				set(user.uid, user, function(err) {
					if(err) cb(err);
					else {
						log('Created phone user',pn);
						cb(null, user);
					}
				});
			});
		}
	});
}

function blankUser(pn, fbid, cb) {
	var user = {
		'uid'      : 0,
		'type'     : '',
		'fbid'     : 0,
		'pn'       : '',
		'iosToken' : '',
		'fbToken'  : '',
		'name'     : ''
	};
	store.hincrby('idCounter', 'user', 1, function(err, next) {
		if (err) return cb(err);
		user.uid = next;
		if (pn) {
			store.hset('pn->uid', pn, user.uid)
		}
		if (fbid) {
			store.hset('fbid->uid', fbid, user.uid)
		}
		cb(null, user);
	});
}

////////////////////////////////////////////////////////////////////////////////
//	DELETING USERS
////////////////////////////////////////////////////////////////////////////////
exports.delete = function(uid, cb) {
	db.deleteItem({
    TableName : 'users',
    Key : {'uid' : {'N' : ''+uid} },
  },
  function(err, data) {
    cb (err || null);
  });
}

////////////////////////////////////////////////////////////////////////////////
// FRIENDLIST GETTERS
////////////////////////////////////////////////////////////////////////////////
function getFriendIdList(uid, cb) {
	getAttributes(''+uid, ['friendList'], function(err, data) {
		if (err) cb(err);
		else if (data.friendList) cb (null, data.friendList.NS.map(parseInt));
		else cb (null, []);
	});
}

exports.getFriendUserList = function(uid, cb) {
	getFriendIdList(uid, function(err, friendIdList) {
    if (err) return cb(err);
    async.map(friendIdList, exports.get, function(err, friendsList) {
      if (err) {
        cb(err);
      } else {
        cb(null, friendsList);
      }
    });
  });
}

////////////////////////////////////////////////////////////////////////////////
// FRIENDLIST SETTERS
////////////////////////////////////////////////////////////////////////////////
exports.addFriendList = function(user, uidList, cb) {
	var params = {
		Key : {'uid' : {'N' : ''+user.uid}},
		TableName: 'users',
		AttributeUpdates: {
			friendList: {
				Action : 'ADD',
				Value: {'NS':uidList}
			}
		}
	}
	db.updateItem(params, function(err, data){
		if (err) cb (err);
		else cb (null, data);
	});
}

////////////////////////////////////////////////////////////////////////////////
// FRIENDLIST REMOVERS
////////////////////////////////////////////////////////////////////////////////

exports.removeFriend = function(user, friendUid, callback) {
	store.srem('friendList:'+user.uid, friendUid, callback);
}


exports.deleteVisible = function(userId, eid, callback) {
  store.srem('viewableBy:'+userId, eid, callback);
}

// exports.setLocation = function(uid, latlng, callback) {
// 	store.hset('locations', uid, JSON.stringify(latlng), callback);
// }
// exports.getLocation = function(uid, callback) {
// 	store.hget('locations', uid, function(err, json){
// 		if(err) callback(err);
// 		else callback(JSON.stringify(json));
// 	});
// }