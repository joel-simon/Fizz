// Abstraction for all database interactions.
var mongojs = require('mongojs');
var config  = require('./../../config.json');
var store = require('./redisStore.js');
var io;
var db = mongojs(config.DB.MONGOHQ_UR, ['users', 'events']);
var exports = module.exports;

exports.isConnected = function(id, callback) {
	if(!io) io = require('../../app.js').io;
	callback(null, io.sockets.clients(''+id).length > 0);
}

exports.get = function(fbid, callback) {
	store.hget('users', fbid, function(err, json) {
		if (err) callback(err);
		else if(!json) callback('No user found'+fbid);
		else callback(null, JSON.parse(json));
	});
}

/*
*	New Player	
*/
exports.add = function(user, callback) {
	store.hincrby('idCounter', 'user', 1 , function(err, next) {
		user.uid = next;
		store.hset('users', user.fbid, JSON.stringify(user), function(err) {
			callback(err, user);
		});
	});
}
exports.getOrAdd = function(profile, token, callback) {
	var user = { 
		uid: 0, // will be set in exports.add
		fbid: +profile.id,
		pn: '',
	 	name: profile.displayName,
	 	hasApp: '',
	 	accessToken: token
	};

	store.hget('users', profile.id, function(err, json) {
		if (err) callback(err);
		else if (json) callback (null, JSON.parse(json))
		else {
			exports.add(user, callback);
		}
	});
}

exports.setLocation = function(uid, latlng, callback) {
	store.hset('locations', uid, JSON.stringify(latlng), callback);
}
exports.getLocation = function(uid, callback) {
	store.hget('locations', uid, function(err, json){
		if(err) callback(err);
		else callback(JSON.stringify(json));
	});
}



// exports.getFromCell = function(cellNum, callback) {
	
// }

// exports.setGroup = function(id, group) {
// 	db.users.findAndModify({
//     query: { _id: id },
//     update: { $set: { group: group } },
//     new: true
// 	}, function(err, doc) {
// 		// console.log('set group', err, doc);
// 	});
// }



