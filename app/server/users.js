// Abstraction for all database interactions.
var args = require('./args.js');
var config = ((args.dev) ? require('./../../configDev.json') : require('./../../config.json'));
var store   = require('./redisStore.js').store;
var utils   = require('./utilities.js');
var log     = utils.log;
var logError = utils.logError;

var nameShorten = utils.nameShorten;

var exports = module.exports;
var async   = require('async');
var fb      = require('./fb.js');


var output  = require('./output.js');
var emit    = output.emit;
var check   = require('easy-types');
var io;

var pg = require('pg');
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

var db = require('./db.js');

exports.parse = function(data) {
	var user = {
		uid: +data.uid,
		pn: data.pn,
		name: data.name
	}
	if (data.fbid) {
		user.appUserDetails = {
			fbid: +data.fbid,
			lastLogin: (data.last_login)
		}
	}
	return user
}

exports.isConnected = function(uid, callback) {
	if(!io) io = require('../../app.js').io;
	return(io.sockets.clients(''+uid).length > 0);
}
////////////////////////////////////////////////////////////////////////////////
//	GET USER
////////////////////////////////////////////////////////////////////////////////
exports.get = function(uid, cb) {
	var q1 = "select * from users where uid = $1";
	db.query(q1, [uid], function(err, result) {
    	if (err) cb(err);
    	else if (!result.rows.length) cb(null, null);
    	else {
    		var r0 = result.rows[0]
    		var user = { uid: r0.uid, pn : r0.pn, name : r0.name}
    		if (r0.fbid) {
    			user.appUserDetails = {
    				fbid: r0.fbid,
    				lastLogin: (r0.last_login)
    			}
    		}
	    	cb(null, user);
	    }
	});
}
exports.getTokens = function(uidList, cb) {
	var q1 = "select uid, token from users where uid = ANY($1::int[])";
	db.query(q1, [uid], function(err, result) {
    	if (err) cb(err);
    	else cb (null, result.rows)
	});
}
exports.getFbToken = function(uid, cb) {
	var q1 = "select uid, fbtoken from users where uid = $1";
	db.query(q1, [uid], function(err, result) {
    	if (err) cb(err);
    	else {
    		if (result.rows.length === 0) cb (null, null)
    		else cb (null, result.rows[0].fbtoken)
    	}
	});
}


exports.getFromFbid = function(fbid, cb) {
	var q1 = "select * from users where fbid = $1";
	db.query(q1, [fbid], function(err, result) {
    	if (err) cb(err);
    	else if (!result.rows.length) cb(null, null);
    	else {
    		var user = exports.parse(result.rows[0])
	    	cb(null, user);
	    }
    });
}

exports.getFromPn = function(pn, cb) {
	var q1 = "select * from users where pn = $1";
	db.query(q1, [pn], function(err, result) {
    	if (err) cb(err);
    	else if (!result.rows.length) cb(null, null);
    	else {
    	  var user = exports.parse(result.rows[0])
	    	cb(null, user);
	    }
    });
}

////////////////////////////////////////////////////////////////////////////////
//	GETTING/CREATING/MODIFYING USERS
////////////////////////////////////////////////////////////////////////////////



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
exports.getOrAddMember = function(profile, fbToken, pn, platform, phoneToken, cb) {
	var fbid = +profile.id;
	exports.getFromFbid(fbid, function(err, user) {
		if (err) return cb(err);
		if (user) return cb(null, user);
		exports.getFromPn(pn, function(err, pnUser) {
			if (err) return cb(err);
			/*
				they were invited to something before they were a member, becoming a
				phone user.
			*/
			if (pnUser) {
				var q1 = "UDPATE users SET type = $1, fbid = $2, WHERE uid = $3";
				db.query(q1, [platform, fbid, pnUser.uid], function(err, result) {
					if (err) return cb (err);
					log('Upgraded '+pnUser.uid+' to member.');
					makeFriends(pnUser.uid)
				});
			// they have never had any interaction with fizz. 
			} else {
				var q1 = "INSERT into users (pn, name, fbid, platform, last_login, fbtoken) values($1,$2,$3,$4,$5,$6) RETURNING uid, last_login";
				db.query(q1, [pn, profile.displayName, fbid, platform, Date.now(), fbToken], function(err, result) {
					if (err) return cb(err);
					log('Created', profile.displayName+' as Member.');
					makeFriends(result.rows[0].uid, (result.rows[0].last_login));
				});
			}
		});
	});
	function makeFriends(uid, lastLogin) {
		return cb(null, { uid: uid, pn : pn, name : profile.displayName, appUserDetails: { fbid:fbid , lastLogin: lastLogin } });
		fbToken = 'CAACEdEose0cBALc0PxbLZAE6UIg2QmTfukkBPRfrb4VFMocmiDTUpeZCXlU52IDSCIx2f51LMnmXlkHHsYzD6vd8g7VPbGFRZA5sNKZCDm0niPyGLYYkBuUTauzEYREzXbJaGL8u4nikRudAYgpEG8VPHzMZBpQeaaZApvuXy4b7DM9JTae4ZA8fz6YKU2ZCAAEZD'
		fb.get(fbToken, '/me/friends/', function(err, friends) {
			if (err) return cb(err);
			if (!friends.data) return cb('no friends list');
			var friendUidList = friends.data.map(function(f){return f.id});
			console.log(uid);
			var q1 = "UPDATE users SET new_friends = array_append(new_friends, $1) WHERE fbid = ANY($2::bigint[])"
			db.query(q1, [uid, friendUidList], function(err) {
				if (err) cb(err);
				else cb(null, { uid: uid, pn : pn, name : profile.displayName, appUserDetails: { fbid:fbid , lastLogin: lastLogin } });
			});		
		});
	}
}
/*
	User has been invited via phone number.
	Return user if already exists.
*/
function getOrAddPhone (pn, name, cb) {
	pn = utils.formatPn(pn);
	exports.getFromPn(pn, function(err, user) {
		if 			(err)  cb(err);
		else if (user) cb(null, user);
		else {
			// var key = newKey()
			// store.hset('key->uid', key, user.uid);
			// user.key = key;
			var q1 = "INSERT INTO users (pn, name, platform, last_login) VALUES ($1,$2,$3,$4) RETURNING uid";
			db.query(q1, [pn, name, 'sms', 0], function(err, result) {
				if (err) return cb(err);
				log('Created phone user '+name);
				var uid = +result.rows[0].uid
				cb(null, { uid:uid, name:name, platform:'sms', uid:uid });
			});
		}
	});
}


exports.getFBFriendList = function(socket) {
  var user = getUserSession(socket);
  var idArr = [];
  fb.get(user.fbToken, '/me/friends', function(err, friends) {
    err = err || friends.error;
    if (err) return logError('from facebook.get:', err);
    if (!friends.data) return logError('no friends data')
    friends = friends.data.map(function(fbuser){return fbuser.id});
    async.map(friends, users.get, function(err, friendsList) {
      if (err) {
        logError(err);
      } else {
        socket.emit('friendList', friendsList);
      }
    })
  });
}

