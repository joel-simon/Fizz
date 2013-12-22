// Abstraction for all database interactions.

var mongojs = require('mongojs'),
		config  = require('./../../config.json');


var connString = config.DB.MONGOHQ_UR;
var db = mongojs(connString, ['users', 'beacons']);

/*
*	New Player	
*/
function addPlayer (id, friends) {
	db.users.insert({'_id': id, 'friends': friends}, function(err){
		if(err)console.log(err);
	});
}

/*
*	Get friends	
*/
function getFriends(id, callback) {
	db.users.findOne({'_id': id}, function(err, user) {
		if( !user ) callback (err, null)
		else callback (err, user.friends);
	});
}

function newBeacon(B, callback) {
	if (!isBeacon(B))
		console.log('INVALID BEACON', B);
	
	db.beacons.insert(B, function(err, a,b){
		if (callback) callback(null);
	});

	function isBeacon(b) {
		return (b.host && b.lat && b.lng && b.desc && 
						(b.attends && b.attends instanceof Array)); 
	}
}

function storeBeacon() {
	return;	
}

module.exports.newBeacon = newBeacon;
module.exports.addPlayer = addPlayer;
module.exports.getFriends = getFriends;