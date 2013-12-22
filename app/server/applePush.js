var fs = require('fs');
var crypto = require('crypto');
var tls = require('tls');
var utils = require('./utilities.js');
var logError = utils.logError;
 
var certPem = fs.readFileSync(__dirname + '/app-cert.pem', encoding='ascii');
var keyPem = fs.readFileSync(__dirname + '/app-key-noenc.pem', encoding='ascii');
var caCert = fs.readFileSync(__dirname + '/apple-worldwide-certificate-authority.cer', encoding='ascii');
var options = { key: keyPem, cert: certPem, ca: [ caCert ] }
 
function connectAPN( next ) {
    var stream = tls.connect(2195, 'gateway.sandbox.push.apple.com', options, function() {
        // connected
        next( !stream.authorized, stream );
    });
}

function hexToBin(hexstr) {
   buf = new Buffer(hexstr.length / 2);
   for(var i = 0; i < hexstr.length/2 ; i++) {
      buf[i] = (parseInt(hexstr[i * 2], 16) << 4) + (parseInt(hexstr[i * 2 + 1], 16));
   }
   return buf;
 }

 // Push token from iPhone app. 32 bytes as hexadecimal string
var hextoken = '85ab4a0cf2 ... 238adf';
module.exports.push = function(hexAddr, mesg) {
	if (typeof hexstr !== 'string') return logError('Invalid push call', hexstr);
	if (typeof msg !== 'string') return logError('Invalid push call', msg);
	var bin = hexToBin(hexAddr);
	var pushnd = { aps: { alert:mesg }};
	payload = JSON.stringify(pushnd);
	var payloadlen = Buffer.byteLength(payload, 'utf-8');
	var tokenlen = 32;
	var buffer = new Buffer(1 +  4 + 4 + 2 + tokenlen + 2 + payloadlen);
	var i = 0;
	buffer[i++] = 1; // command
	var msgid = 0xbeefcace; // message identifier, can be left 0
	buffer[i++] = msgid >> 24 & 0xFF;
	buffer[i++] = msgid >> 16 & 0xFF;
	buffer[i++] = msgid >> 8 & 0xFF;
	buffer[i++] = msgid > 0xFF;
	 
	// expiry in epoch seconds (1 hour)
	var seconds = Math.round(new Date().getTime() / 1000) + 1*60*60;
	buffer[i++] = seconds >> 24 & 0xFF;
	buffer[i++] = seconds >> 16 & 0xFF;
	buffer[i++] = seconds >> 8 & 0xFF;
	buffer[i++] = seconds > 0xFF;
	 
	buffer[i++] = tokenlen >> 8 & 0xFF; // token length
	buffer[i++] = tokenlen & 0xFF;
	var token = hextobin(hextoken);
	token.copy(buffer, i, 0, tokenlen)
	i += tokenlen;
	buffer[i++] = payloadlen >> 8 & 0xFF; // payload length
	buffer[i++] = payloadlen & 0xFF;
	 
	var payload = Buffer(payload);
	payload.copy(buffer, i, 0, payloadlen);
	 
	stream.write(buffer);  // write push notification
}
stream.on('data', function(data) {
   var command = data[0] & 0x0FF;  // always 8
   var status = data[1] & 0x0FF;  // error code
   var msgid = (data[2] << 24) + (data[3] << 16) + (data[4] << 8 ) + (data[5]);
   console.log(command+':'+status+':'+msgid);
 });