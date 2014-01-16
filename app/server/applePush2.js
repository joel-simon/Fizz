var apn = require('apn');
var fs = require('fs');


var certPem = fs.readFileSync(__dirname + '/cert.pem', encoding='ascii');
var keyPem = fs.readFileSync(__dirname + '/key.pem', encoding='ascii');
var caCert = fs.readFileSync(__dirname + '/apple-worldwide-certificate-authority.cer', encoding='ascii');
var token ='BC45506F3DD570B9C51363068DFBEF0FE178B7F7318D3CA7485F6040F980B74A';

var options = {
	key: __dirname + '/key.pem',
	cert: __dirname + '/cert.pem',
	"gateway": "gateway.sandbox.push.apple.com",
	'address':"gateway.sandbox.push.apple.com"
};
// var options = {
//     cert: "apns-dev-cert.pem",          
//     key:  "apns-key.pem",               
//     passphrase: null,   
//     gateway: "gateway.sandbox.push.apple.com",              
//     port: 2195,                         
//     enhanced: true,                     
//     errorCallback: undefined,                       
//     cacheLength: 5                                  
// };

var token ='BC45506F3DD570B9C51363068DFBEF0FE178B7F7318D3CA7485F6040F980B74A';

var apnConnection = new apn.Connection(options);
var myDevice = new apn.Device(token);

var note = new apn.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 2*3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "Beacon Data";
note.payload = {'messageFrom': 'Joel'};

apnConnection.pushNotification(note, myDevice);


var options1 = {
    "batchFeedback": true,
    "interval": 300
};
var feedback = new apn.Feedback(options1);
feedback.on("feedback", function(devices) {
		console.log(devices);
    // devices.forEach(function(item) {
    // 	console.log(item);
    //     // Do something with item.device and item.time;
    // });
});

console.log('done');