var config  = require('./../../config.json');
var redis   = require('redis');
var rtg  = require("url").parse(config.DB.REDISTOGO_URL);   
var store = redis.createClient(rtg.port, rtg.hostname);
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

module.exports = store;