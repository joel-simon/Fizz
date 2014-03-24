var https = require('https');
var path = require('path'),
	appDir = path.dirname(require.main.filename),
	config = require(appDir+'/configDev.json');
exports.get = function(accessToken, apiPath, callback) {
	
	// creating options object for the https request
	var options = {
		// the facebook open graph domain
		host: 'graph.facebook.com',
 
		// secured port, for https
		port: 443,
 
		// apiPath is the open graph api path
		path: apiPath + '?access_token=' + accessToken,
 
		// well.. you know...
		method: 'GET'
	};
 
	// create a buffer to hold the data received
	// from facebook
	var buffer = '';
 
	// initialize the get request
	var request = https.get(options, function(result){
		result.setEncoding('utf8');
 
		// each data event of the request receiving
		// chunk, this is where i`m collecting the chunks
		// and put them together into one buffer...
		result.on('data', function(chunk){
			buffer += chunk;
		});
		
		// all the data received, calling the callback
		// function with the data as a parameter
		result.on('end', function(){
			callback(null, JSON.parse(buffer));
		});
	});
	
	// just in case of an error, prompting a message
	request.on('error', function(e){
		callback(e);
	});
 
	request.end();
}

exports.getFriendUidList = function(fbToken, cb) {
	console.log('test');
	exports.get(fbToken, '/me/friends',function(err, foo) {
		if (err) cb(err);
		else cb(null, foo.data.map(function(obj){return obj.id}));
	});
}

exports.extendToken = function(accessToken, callback) {
	var buffer = [];
	var options = {
		host: 'graph.facebook.com',
		port: 443,
		// apiPath is the open graph api path
		path: ('/oauth/access_token'+
					'?client_id='+config.FB.FACEBOOK_APP_ID+
					'&client_secret='+config.FB.FACEBOOK_APP_SECRET+
					'&grant_type=fb_exchange_token'+
					'&fb_exchange_token='+accessToken),
		method: 'GET'
	};
	var request = https.get(options, function(result){
		result.setEncoding('utf8');
		result.on('data', function(chunk){
			buffer += chunk;
		});
		result.on('end', function(){
			callback(null, (buffer.split('&')[0]).split('=')[1]);
		});
	});
}