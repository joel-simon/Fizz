module.exports.newBeacon = newBeacon;
module.exports.addPlayer = addPlayer;
module.exports.getGroup = getGroup;


// Abstraction for all database interactions.
var mongojs = require('mongojs'),
		config  = require('./../../config.json');


var connString = config.DB.MONGOHQ_UR;
var db = mongojs(connString, ['users', 'beacons']);

/*
*	New Player	
*/
function addPlayer (id, group) {
	db.users.insert({'_id': id, 'group': group}, function(err){
		if(err)console.log(err);
	});
}

/*
*	Get group	
*/
function getGroup(id, callback) {
	db.users.findOne({'_id': id}, function(err, user) {
		if( !user ) callback (err, null)
		else callback (err, user.group);
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

