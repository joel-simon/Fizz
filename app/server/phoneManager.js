var store   = require('./redisStore.js').store;
var twilioNumbers = [
  '+13476255694',
  '+14123301599',
  '+14123301653',
  '+14123301648'
];
module.exports = exports;
/*
	Given a user and a event, return which number they use to 
	speak to that event.
*/
function redisKey(u){ 
	return u.uid+':pnMan'
}

exports.getPn = function (user, eid, cb) {
	store.get(redisKey(user), function(err, data) {
		if (err) return cb(err);
		if (data){
			var data = JSON.parse(data); // array [pni0, eid0, pni1, eid1... ]
			var i = data.eidList.indexOf(eid);
			if (i >=1) return cb(null, twilioNumbers[data.pniList[i]]);
		} else {
			data = {eidList:[],pniList:[]};
		}
		

		store.hincrby('idCounter', 'pncount:'+user.uid, 1, function(err, pni) {
			data.eidList.push(+eid);
			data.pniList.push(+pni);
			store.set(redisKey(user), JSON.stringify(data), function(err) {
				if (err) return cb(err);
				cb (null, twilioNumbers[pni]);
			});
		});

	});	
}
/*
	Given a user and a pn, get which event they talk to on that pn.
*/
exports.getEid = function(user, pn, cb) {
	var pni = twilioNumbers.indexOf(pn)
	store.get(redisKey(user), function(err, data) {
		var data = JSON.parse(data);
		var i = data.pniList.indexOf(pni);
		if (i >=0) return cb(null, +data.eidList[i]);
		console.log('really shouldnt ever get here... crap');		
		// store.hincrby('idCounter', 'pncount:'+user.uid, 1, function(err, pni) {
		// 	data.push(+pni, +eid);
		// 	store.set(redisKey(user), JSON.stringify(data), function(err) {
		// 		if (err) return cb(err);
		// 		cb (null, twilioNumbers[pni]);
		// 	});
		// });

	});	
}