module.exports = exports;

require('coffee-script/register');

var args = require('./../args.js');
var config = require('./../config')
var redis   = require('redis');

var  rtg  = require("url").parse(config.DB.REDISTOGO_URL),
pub = redis.createClient(rtg.port, rtg.hostname),
sub = redis.createClient(rtg.port, rtg.hostname),
store = redis.createClient(rtg.port, rtg.hostname);

pub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
sub.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});


module.exports.store = store;
module.exports.pub = pub;
module.exports.sub = sub;

