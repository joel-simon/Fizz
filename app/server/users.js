// Abstraction for all database interactions.
var mongojs = require('mongojs'),
		config  = require('./../../config.json'),
		redis   = require('redis');

var rtg  = require("url").parse(config.DB.REDISTOGO_URL);		
var store = redis.createClient(rtg.port, rtg.hostname);
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
var db = mongojs(config.DB.MONGOHQ_UR, ['users', 'beacons']);

module.exports.getVisible = function(userId, callback) {
	store.smembers('viewableBy:'+userId, callback);
}

    
module.exports.addVisible = function(userId, bId, callback) {
	store.sadd('viewableBy:'+userId, bId, callback);
}

module.exports.deleteVisible = function(userId, bId, callback) {
	store.srem('viewableBy:'+userId, bId, callback);
}

module.exports.isConnected = function(id, callback) {
	store.hget('connections', id, function(err, connections) {
		if (err) callback(err);
		else callback(null, (connections > 0));
	});
}
module.exports.incConnections = function(id, callback) {
	store.hincrby('connections', id, 1, callback);
}
module.exports.decConnections = function(id, callback) {
	store.hincrby('connections', id, -1, callback);
}

module.exports.isBeaconer = function(id, callback) {
	store.sismember('beaconers', id, callback);
}
/*
*	New Player	
*/
module.exports.addUser = function(id, data, callback) {
	db.users.insert({'_id': id, 'data': data}, function(err, doc){
		if(err) callback(err)
		else callback(null, doc);
	});
}

/*
*	Get group	
*/
module.exports.getUser = function(id, callback) {
	db.users.findOne({'_id': id}, function(err, user) {
		if (err) callback(err);
		else if( !user ) callback (null, null);
		else callback (err, user.data);
	});
}

module.exports.setGroup = function(id, group) {
	db.users.findAndModify({
    query: { _id: id },
    update: { $set: { group: group } },
    new: true
	}, function(err, doc) {
		console.log('set group', err, doc);
	});
}

module.exports.newBeacon = function(B, callback) {
	db.beacons.insert(B, function(err, a,b){
		if (callback) callback(null);
	});

}

function storeBeacon() {
	return;	
}

