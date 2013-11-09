var mongojs = require('mongojs');
var connString = 'beacon:derptopia@paulo.mongohq.com:10096/app18950623'
var db = mongojs(connString, ['users']);

function addPlayer (id, friends) {
	db.users.insert({'_id': id, 'friends': friends}, function(err){
		if(err)console.log(err);
	});
}


function getFriends(id, callback) {
	db.users.findOne({'_id': id}, function(err, user) {
		if( !user ) callback (err, null)
		else callback (err, user.friends);
	});
}

module.exports.addPlayer = addPlayer;
module.exports.getFriends = getFriends;