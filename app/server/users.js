var async = require('async');
var validate = require('./utilities').validate;
var utils = require('./utilities');
var posInt = utils.posInt;

module.exports.set = function(store) {
	this.store = store;
	return module.exports;
}

module.exports.setGroup = function(userID, group, callback) {
	if (!posInt(userID)) return callback('invalid userID', userID);
	if (!verifyArray(posInt, group)) return callback('invalid userID', userID);

};


module.exports.getGroup = function(fuserId, callback) {
	// body...
};