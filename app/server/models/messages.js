var async = require('async');
var sanitize = require('validator').sanitize;
var store = require('./../adapters/redisStore.js').store;
var pg = require('pg');
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';
exports = module.exports;

exports.add = function(uid, eid, text) {
	var q2 = "INSERT INTO messages (mid, eid, data) VALUES ($1, $2, $3)";
	
}

