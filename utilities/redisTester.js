var redis   = require('redis');
var url = 'redis://redistogo:7771d0cc39827f1664b16523d1b92768@crestfish.redistogo.com:10325/';

// create pub/sub channels for sockets using redis. 
var rtg  = require("url").parse(url);
console.log(rtg.port, rtg.hostname);

var store = redis.createClient(rtg.port, rtg.hostname);
store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});

function makeRand(n) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < n; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var desc = makeRand(140);
var title = makeRand(30);

var B = JSON.stringify({
	  host: '1380180579',
		lat: 40.442129702590535,
		lng: -79.9444842338562,
		desc: desc,
		attends: [1380180579,1380180579,1380180579,1380180579,1380180579,1380180579,1380180579,1380180579,1380180579,1380180579],
		title: title
});

for (var i = 0; i < 100; i++) {
	store.hset('publicBeacons', makeRand(20), B, redis.print);
};
