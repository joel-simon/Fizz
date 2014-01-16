// Abstraction for all database interactions.
var mongojs = require('mongojs'),
		config  = require('./../../config.json'),
		redis   = require('redis'),
		io;

var rtg  = require("url").parse(config.DB.REDISTOGO_URL);		
var store = redis.createClient(rtg.port, rtg.hostname);
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
var db = mongojs(config.DB.MONGOHQ_UR, ['users', 'beacons']);
var exports = module.exports;
exports.getVisible = function(userId, callback) {
	store.smembers('viewableBy:'+userId, callback);
}

    
exports.addVisible = function(userId, bId, callback) {
	store.sadd('viewableBy:'+userId, bId, callback);
}

exports.deleteVisible = function(userId, bId, callback) {
	store.srem('viewableBy:'+userId, bId, callback);
}

exports.isConnected = function(id, callback) {
	if(!io) io = require('../../app.js').io;
	callback(null, io.sockets.clients(''+id).length > 0);
}


exports.isBeaconer = function(id, callback) {
	store.sismember('beaconers', id, callback);
}
/*
*	New Player	
*/
exports.addUser = function(id, data, callback) {
	var friends = data.friends || [],
			group = data.group || grop,
			hasApp = data.hasApp || false,

			userData = {'_id': +id,
								 'friends':friends,
								 'group':group,
									'hasApp':hasApp};


	db.users.insert(userData, function(err, doc) {
		if(err) callback(err)
		else callback(null, doc);
	});
}

exports.getUser = function(id, callback) {
	db.users.findOne({'_id': +id}, function(err, user) {
		if (err) callback(err);
		else if( !user ) callback (null, null);
		else callback (err, user);
	});
}
exports.getFromCell = function(cellNum, callback) {
	
}

exports.setGroup = function(id, group) {
	db.users.findAndModify({
    query: { _id: id },
    update: { $set: { group: group } },
    new: true
	}, function(err, doc) {
		// console.log('set group', err, doc);
	});
}

exports.newBeacon = function(B, callback) {
	db.beacons.insert(B, function(err, a,b){
		if (callback) callback(null);
	});

}

