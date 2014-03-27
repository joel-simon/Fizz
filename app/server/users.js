// Abstraction for all database interactions.
var mongojs = require('mongojs');
var args = require('./args.js');
var config = ((args.dev) ? require('./../../configDev.json') : require('./../../config.json'));
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
  user:{uid} 			| eid -> pn // what pn user uses for this event
  									count -> int //number of events ever invited to
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
	getAttributes(''+uid, ['type', 'fbid', 'pn', 'name', 'key'], function(err, data) {
		if (err) cb(err);
		else if (!data) cb(null, null);
		else {
			cb(null, {
				uid  : +uid,
				name : data.name.S,
				pn   : data.pn.S,
				type : data.type.S,
				fbid : +data.fbid.N,
				key : data.key.S
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
exports.getFromKey = function(key, cb) {
	store.hget('key->uid', key, function(err, uid) {
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
		// friendList: 
	}
	if (user.friendList && user.friendList.length > 0) {
		item.friendList = {'NS' : user.friendList.map(String)}
	}
	if (user.key) item.key = {'S' : user.key};

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

function findFizzFriends(fbToken,  cb) {
	fb.get(fbToken, '/me/friends/', function(err, friends) {
		if (err) return cb(err);
		if (!friends.data) return cb(null, []);
		async.map(friends.data, function(friend, cb2) {
			// console.log(friend);
			store.hget('fbid->uid', friend.id, function(err, uid) {
				if(err) return cb2(err);
				if(!uid) return cb2(null, null);
				cb2(null, +uid);
			});
		},
		function(err, fizzFriends) {
			cb(null, fizzFriends.filter(function(u){return !!u}));
		});
	});
}

exports.getOrAddPhoneList =  function(pnList, cb) {
	async.map(pnList, exports.getOrAddPhone,
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
				findFizzFriends(fbToken, function(err, fizzFriends) {
					// console.log('fizzFriends:', fizzFriends);
					if (err) return cb(err);
					if (user && user.type === 'Phone') {
						user.type = 'Member';
						user.iosToken = iosToken;
						user.fbid = fbid;
						user.name = profile.displayName;
						user.friendList = fizzFriends;
						store.hset('fbid->uid', fbid, user.uid);
						log('Upgraded', user.name, 'from Phone to Member. \n\thas friends:', fizzFriends);
						set(user.uid, user, cb);
					} else { // create a new user from scratch.
						blankUser(pn, fbid, function(err, user) {
							if (err) return cb(err);
							user.pn = pn;
							user.type = "Member";
							user.name = profile.displayName;
							user.fbid = fbid;
							user.friendList = fizzFriends;
							log('Created', user.name, 'as Member.\n\thas friends:', fizzFriends);
							set(user.uid, user, cb);
						});
					}
				});
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
		 	set(user.uid, user, cb);
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
				store.hset('users:'+user.uid, 'count', 0);
				
				var key = newKey()
				store.hset('key->uid', key, user.uid);
				user.key = key;

				user.pn = pn;
				user.type = "Phone";
				user.name = pn;

				set(user.uid, user, function(err) {
					if(err) cb(err);
					else {
						log('Created phone user'+pn+'. Has key:'+key);
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

	store.hincrby('idCounter', 'user', 1, function(err, uid) {
		if (err) return cb(err);	
		user.uid = uid;
		if (pn) {
			store.hset('pn->uid', pn, user.uid);
		}
		if (fbid) {
			store.hset('fbid->uid', fbid, user.uid)
		}
		cb(null, user);
	});
}
function newKey() {
		var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = 5; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
// var rString = randomString(32, );
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
		else if (data.friendList) {
			// console.log(data.friendList.NS);
			cb (null, data.friendList.NS.map(function(foo){return +foo}));
		} else cb (null, []);
	});
}

exports.getFriendUserList = function(uid, cb) {
	getFriendIdList(uid, function(err, friendIdList) {
		// console.log(err, friendIdList);
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

exports.getFizzFriendsUidsOf = function(friends, cb) {
	var fof = {};
	async.each(friends, function(user, hollaback) {
		getFriendIdList(user.uid, function(err, friendUids) {
			if (err) hollaback(err);
			else if (!friendUids.length) cb(null, []);
			else {
				console.log('284',friendUids);
				friendUids.forEach(function(f){ fof[f]=true });
				hollaback(null);
			}
		});
	}, function(err){
		if(err) cb(err);
		else cb(null, fof)
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