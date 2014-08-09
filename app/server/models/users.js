require('coffee-script');
// Abstraction for all database interactions.
var args = require('./../args.js');
var config = require('./../config')
var store   = require('./../adapters/redisStore.js').store;
var utils   = require('./../utilities.js');
var log     = utils.log;
var logError = utils.logError;

var nameShorten = utils.nameShorten;

var exports = module.exports;
var async   = require('async');


var output  = require('./../output.js');
var emit    = output.emit;
var check   = require('easy-types');
var io;

var pg = require('pg');
var db = require('./../adapters/db.js');
var dbstring = db.connString;

exports.parse = function(data) {
	var user = {
		uid: parseInt(data.uid),
		pn: data.pn,
		name: data.name,
		lastLogin: parseInt(data.last_login),
		password: data.password,
		platform: data.platform
	}
	return user
}

exports.isConnected = function(uid, callback) {
	if(!io) io = require('../../app.js').io;
	return(io.sockets.clients(''+uid).length > 0);
}
////////////////////////////////////////////////////////////////////////////////
//	GET USER
////////////////////////////////////////////////////////////////////////////////
exports.get = function(uid, cb) {
	var q1 = "select * from users where uid = $1";
	db.query(q1, [uid], function(err, result) {
    	if (err) cb(err);
    	else if (!result.rows.length) cb(null, null);
    	else {
    		var r0 = result.rows[0]
    		var user = { uid: r0.uid, pn : r0.pn, name : r0.name}
	    	cb(null, user);
	    }
	});
}
exports.getTokens = function(uidList, cb) {
	var q1 = "select uid, phone_token from users where uid = ANY($1::int[])";
	db.query(q1, [uid], function(err, result) {
    	if (err) cb(err);
    	else cb (null, result.rows)
	});
}

exports.getFromPn = function(pn, cb) {
	var q1 = "select * from users where pn = $1";
	db.query(q1, [pn], function(err, result) {
    	if (err) cb(err);
    	else if (!result.rows.length) cb(null, null);
    	else {
    	  var user = exports.parse(result.rows[0])
	    	cb(null, user);
	    }
    });
}

////////////////////////////////////////////////////////////////////////////////
//	GETTING/CREATING/MODIFYING USERS
////////////////////////////////////////////////////////////////////////////////


exports.create = function(pn, name, platform, token, callback) {
	var password = generatePassword();
	var q1 = "INSERT INTO users (pn, name, platform, phone_token, password) VALUES ($1,$2,$3,$4,$5) RETURNING uid";
	var values = [pn, name, platform, token, password]
	db.query(q1, values, function(err, result) {
		if (err) return callback(err)
		uid = +result.rows[0].uid
		callback(null, {uid:uid, pn:pn, name:name, platform:platform, password:password})
	});
};

exports.getOrAddList =  function(namePnList, cb) {
	async.map(namePnList,
		function(namePn, cb) {
			getOrAdd(namePn.pn, namePn.name, cb)
		},
		function(err, userList) {
			if (err) cb (err);
			else cb (null, userList);
		}
	);
}

/*
	User has been invited via phone number.
	Return user if already exists.
*/
function getOrAdd (pn, name, cb) {
	pn = utils.formatPn(pn)
	exports.getFromPn(pn, function(err, user) {
		if 			(err)  cb(err)
		else if (user) cb(null, user)
		else {
			exports.create(pn, name, 'sms', '', cb)
		}
	});
}


function generatePassword() {
    var text = "";
    var possible = "0123456789";
    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}