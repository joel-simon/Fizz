// Abstraction for all database interactions.
var mongojs = require('mongojs');
var args = require('./args.js');
var config = ((args.dev) ? require('./../../configDev.json') : require('./../../config.json'));
var store   = require('./redisStore.js').store;
var utils   = require('./utilities.js');
var log     = utils.log;
var logError = utils.logError;
var nameShorten = utils.nameShorten;
var db      = mongojs(config.DB.MONGOHQ_UR, ['users', 'events']);
var exports = module.exports;
var async   = require('async');
var fb      = require('./fb.js');
var db      = require('./dynamo.js');
var output  = require('./output.js');
var emit    = output.emit;
var check   = require('easy-types');
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
	log('getting for '+uid, typeof(uid));
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
	// store.get('user:'+user.uid, function(err, jsonUser) {
	// 	return cb(null, JSON.parse(jsonUser));
	// });
	getAttributes(''+uid, ['type', 'fbid', 'pn', 'name', 'key'], function(err, data) {
		if (err) cb(err);
		else if (!data) cb('No user found for uid:'+uid, null);
		else {
			cb(null, {
				uid  : +uid,
				name : data.name.S,
				pn   : data.pn.S,
				type : data.type.S,
				fbid : +data.fbid.N,
				key : data.key ? data.key.S : undefined
			});
		}
	});
}
exports.getIosToken = function(uid, cb) {
	if(!uid) {
		return logError('tried to get bad uid:'+uid);
	}
	getAttributes(''+uid, ['iosToken'], function(err, data) {
		if (err) cb(err);
		else if (!data) cb(null, null);
		else {
			cb(null,data.iosToken.S);
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
function set(user, cb) {
	// return store.set('user:'+user.uid, JSON.stringify(user), cb);
	var item = {
		uid  : {'N'  : ''+user.uid},
		pn   : {'S'  : user.pn},
		fbid : {'N'  : ''+user.fbid},
		name : {'S'  : user.name},
		type : {'S'  : user.type},
		iosToken: {'S' : user.iosToken || 'iosToken'},
		key : {'S' : user.key || 'key'},
		// friendList: 
	}
	if (user.friendList && user.friendList.length > 0) {
		item.friendList = {'NS' : user.friendList.map(String)}
	}
	if (user.key) item.key = {'S' : user.key};
	delete user.friendList;
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


//HELPER FUNCTION FOR MAKEFRIENDS
function findFizzFriends(fbToken,  cb) {
	fb.get(fbToken, '/me/friends/', function(err, friends) {
		if (err) return cb(err);
		if (!friends.data) return cb(null, []);
		async.map(friends.data, function(friend, cb2) {
			exports.getFromFbid(friend.id, function(err, user) {
				if(err) return cb2(err);
				if(!user) return cb2(null, null);
				cb2(null, user);
			});
		},
		function(err, fizzFriends) {
			cb(null, fizzFriends.filter(function(u){return !!u}));
		});
	});
}

function makeFriends(user, fbToken, cb) {
	findFizzFriends(fbToken, function(err, friendUserList) {
		// console.log('test2', err, friendUserList);
		if (err) return cb(err);
    // for each of the users new friends, reciprocate the friendship and emit.
    async.each(friendUserList, function(friend, cb2) {
      exports.addFriendList(friend, [''+user.uid], function(err) {
        if(err) return cb2(err)
        
        emit({
          eventName:  'newFriend',
          data:       {user: user},
          recipients: [friend],
        })
      	output.pushIos({
      		userList: [friend],
          msg: nameShorten(user.name)+' '+'has added you as friend!'
        });
        cb2(null);

      });
    },
    function(err) {
      if(err) cb(err);
      else cb(null, friendUserList);
    });
	});
}

exports.getOrAddPhoneList =  function(pnList, cb) {
	async.map(pnList, getOrAddPhone, function(err, userList) {
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

	exports.getFromFbid(fbid, function(err, user) {
		if (err) return cb(err);
		if (user) return cb(null, user);
		
		exports.getFromPn(pn, function(err, pnUser) {
			if (err) return cb(err);
			var member = {
				name : profile.displayName,
				type : 'Member', 
				fbid : fbid,
				pn : pn,
				iosToken : iosToken
			}
			if (pnUser) {
				member.uid = pnUser.uid;
				store.hset('fbid->uid', fbid, member.uid);
				log('Upgraded '+member.name, 'From Phone to Member.');
				done(member);
			} else {
				blankUser(pn, fbid, function(err, newBlank) {
					member.uid = newBlank.uid;
					if (err) return cb(err);
					log('Created', member.name, 'as Member.');
					done(member);
				});
			}
		});
	});
	function done(member) {
		makeFriends(member, fbToken, function(err, friendUserList){
			if (err) return cb(err);
			member.friendList = friendUserList.map(function(user){return user.uid});
			return set(member, cb);
		});
	}
}



/*
	User has been invited via phone number.
	Return user if already exists.
*/
function getOrAddPhone (u, cb) {
	u.pn = utils.formatPn(u.pn);
	exports.getFromPn(u.pn, function(err, user) {
		if 			(err)  cb(err);
		else if (user) cb(null, user);
		else {
			blankUser(u.pn, null, function(err, user) {
				if (err) return cb(err);
				store.hset('users:'+user.uid, 'count', 0);
				
				var key = newKey()
				store.hset('key->uid', key, user.uid);
				user.key = key;

				user.pn = u.pn;
				user.type = "Phone";
				user.name = u.name || u.pn;

				set(user, function(err) {
					if(err) cb(err);
					else {
						log('Created phone user'+u.pn+'. Has key:'+key);
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
	// if(user.uid == 2 && uidList.indexOf(3) >= 0 ){
	// 	uidList = uidList.split(uidList.indexOf(3),1)
	// }
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

// Deal with phone numbers

exports.getUserAndEidFromPn = function(pn, cb) {

}

exports.getNextPN = function(uid) {

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

// /*
// 	User has been invited via text and goes to the website. 
// 	Must already exist as a phone user.
// */
// exports.getOrAddGuest = function(profile, fbToken, cb) {
// 	exports.getFromFbid(+profile.id, function(err, user) {
// 		if (err)  return cb(err);
// 		if (user) return cb(null, user);
// 		exports.getOrAddPhone(pn, function(err, user) {
// 			if (err) return cb(err);
// 			store.hset('fbid->uid', +profile.id, user.uid);
// 			user.fbid = +profile.id;
// 		 	user.name = profile.displayName;
// 		 	user.type = 'Guest';
// 		 	user.fbToken = fbToken;
// 		 	set(user, cb);
// 		});
		
// 	});
// }