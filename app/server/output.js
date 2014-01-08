/*
  Wrappers for push, sms and socket output
*/
var 
  utils   = require('./utilities.js'),
  log     = utils.log,
  config  = require('./../../config.json'),
  exports = module.exports,
  users   = require('./users.js'),
  async   = require('async'),
  apn     = require('apn');

// var fs = require('fs');
// var certPem = fs.readFileSync(__dirname + '/cert.pem', encoding='ascii');
// var keyPem = fs.readFileSync(__dirname + '/key.pem', encoding='ascii');
// var caCert = fs.readFileSync(__dirname + '/apple-worldwide-certificate-authority.cer', encoding='ascii');
// var token ='BC45506F3DD570B9C51363068DFBEF0FE178B7F7318D3CA7485F6040F980B74A';

var options = {
  key: __dirname + '/key.pem',
  cert: __dirname + '/cert.pem',
  "gateway": "gateway.sandbox.push.apple.com",
  'address':"gateway.sandbox.push.apple.com"
}
var apnConnection = new apn.Connection(options);
var options1 = {
    "batchFeedback": true,
    "interval": 300
}
var feedback = new apn.Feedback(options1);
feedback.on("feedback", function(devices) {
  console.log(devices);
    // devices.forEach(function(item) {
    //  console.log(item);
    //     // Do something with item.device and item.time;
    // });
});

exports.pushIos = function(msg, token, hoursToExpiration) {
  if(!msg || !token) return;

  var myDevice = new apn.Device(token);
  var note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600*hoursToExpiration;
  note.badge = 3;
  note.sound = "ping.aiff";
  note.alert = "Beacon Data";
  note.payload = {'messageFrom': 'Beacon'};

  apnConnection.pushNotification(note, myDevice);
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var twilio = require('twilio');
var client = new twilio.RestClient(config.TWILIO.SID, config.TWILIO.TOKEN);


exports.sendSms = function(to, msg) {
  client.sms.messages.create({
    to:'+'+to,
    from:'+13476255694',
    body:msg
  },
  function(error, message) {
    if (!error) {
      log('sent sms to',to);
      // console.log('Success! The SID for this SMS message is:');
      // console.log(message.sid);
       
      // console.log('Message sent on:');
      // console.log(message.dateCreated);
    } else {
      console.log('Oops! There was an error.', error);
    }
  });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Emit from a certain person
 * @param {Number} userId
 * @param {String} eventName
 * @param {Object} Data
 */
 var io;
exports.emit = function(userId, eventName, data, message) {
  // deal with a circular dependency by delaying invocation.
  if(!io) io = require('../../app.js').io;
  io.sockets.in(userId).emit(eventName, data);
  users.getUser(userId, function(err, userData) {
    if (err) return logError(err);
    if (!userData) return logError('no userData found');
    async.each(userData.group, function(friend, callback) {

      // users.isConnected(id, function(err, isCon) {
      //   if (isCon) {
        io.sockets.in(friend.id).emit(eventName, data);
        if (friend.phoneNumber && message) {
          exports.sendSms(friend.phoneNumber, message);
         
          
        }
        // users.hasApp(id, function(err, hasApp){
        //   if (hasApp) pushIos(userId, eventName, data);
        //   else sendSms(userId, eventName, data)

        // })
        // }
        
      // });
    });
  });
}
