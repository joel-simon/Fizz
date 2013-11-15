// Abstraction for all database interactions.

var mongojs = require('mongojs');

var connString = process.env.MONGOHQ_UR;//'beacon:derptopia@paulo.mongohq.com:10096/app18950623';//
console.log('MONGO URL:',connString);
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

module.exports.newBeacon = newBeacon;
module.exports.addPlayer = addPlayer;
module.exports.getFriends = getFriends;