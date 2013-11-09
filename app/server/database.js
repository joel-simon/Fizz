var mongojs = require('mongojs');
var connString = 'beacon:derptopia@paulo.mongohq.com:10096/app18950623'
var db = mongojs(connString, ['users']);

function addPlayer (id, friends) {
	db.users.insert({'_id': id, 'friends': friends}, function(err){
		if(err)console.log(err);
	});
}


function getFriends(id, callback) {
	db.users.find({'_id': id}, function(err, docs) {
		console.log(err, docs);
	});
}

module.exports.addPlayer = addPlayer;
module.exports.getFriends = getFriends;