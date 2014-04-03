var store   = require('./redisStore.js').store;
var twilioNumbers = [
  '+13476255694',
  '+14123301599',
  '+14123301653',
  '+14123301648'
];
module.exports = exports;
exports.getNumberFor = function (user, eid, cb) {
	store.get(''+user.uid+':'+eid, function(err, pni) {
		if (pni) return cb(null, twilioNumbers[+pni]);
		store.hincrby('idCounter', 'pncount:'+user.uid, 1, function(err, pni) {
			store.set(''+user.uid+':'+eid, pni, function(err) {
				if (err) return cb(err);
				cb (null, twilioNumbers[pni]);
			});
		});
	});	
}

exports.getUserAndEidFromPn = function(pn, cb) {

	cb (null, user, eid);
}