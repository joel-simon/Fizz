/*
  Wrappers for push, sms and socket output
*/
var 
  utils    = require('./utilities.js'),
  log      = utils.log,
  logError = utils.logError,
  logI     = utils.logImportant,
  config   = require('./../../config.json'),
  exports  = module.exports,
  users    = require('./users.js'),
  async    = require('async'),
  apn      = require('apn'),
  args     = require('./args.js');


////////////////////////////////////////////////////////////////////////////////
//        PUSH IOS
////////////////////////////////////////////////////////////////////////////////

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

  // if (!args.pushIos) {
  //   logI("PUSH ios\n\t\tTo:"+token+"\n\t\tMsg:"+msg);
  //   return;
  // }

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
// TWILIO
////////////////////////////////////////////////////////////////////////////////

var twilio = require('twilio');
var client = new twilio.RestClient(config.TWILIO.SID, config.TWILIO.TOKEN);


exports.sendSms = function(to, msg) {
  // if (!args.sendSms) {
  //+"\n\t\tMsg:"+msg);
  //   return;
  // }
  client.sms.messages.create({
    to:'+'+to,
    from:'+13476255694',
    body:msg
  },
  function(error, message) {
    if (error) logError('Oops! There was an error.', error);
    else log('sent sms to',to);
  });
}

////////////////////////////////////////////////////////////////////////////////
// SOCK.IO
////////////////////////////////////////////////////////////////////////////////
/**
 * Emit from a certain person
 * @param {Number} userId
 * @param {String} eventName
 * @param {Object} Data
 */
var io;
exports.emit = function(options) {
  // check.is(options, {
  //   eventName: 'string',
  //   data: 'object',
  //   recipients: '[user]',
  //   smsRecip: '[string]'
  // });
  var 
    eventName  = options.eventName,
    data       = options.data,
    recipients = options.recipients,
    iosPush    = options.iosPush || null,
    sms        = options.sms || null;

  // Deal with a circular dependency by delaying invocation.
  if(!io) io = require('../../app.js').io;

  log('Emitting '+eventName+
      '\n\t\tto:'+JSON.stringify(recipients.map(function(u){return u.name+':'+u.type}))+
      '\n\t\tdata:' + JSON.stringify(data)
      );

  async.each(recipients, function(user, callback) {
    switch(user.type) {
      case 'Phone':
        if (sms && args.sendSms) {
          exports.sendSms(user.pn, sms);
          log("SENT SMS To "+user.name);
        } else if(sms){
          log("SMS NOT SENT TO '"+user.name+"' ENABLE SMS WITH 'node app sendSms'");
        }
        break;

      case "Guest":
        if (users.isConnected(user.uid)) {
          io.sockets.in(user.uid).emit(eventName, data);
        } else if (sms) {
          if (args.sendSms){
            exports.sendSms(user.pn, message);
            log("SENT SMS To "+user.name);
          } else {
            log("SMS NOT SENT TO '"+user.name+"' ENABLE SMS WITH 'node app sendSms'");
          }
        }
        break;

      case "Member":
        if (users.isConnected(user.uid)) {
          io.sockets.in(''+user.uid).emit(eventName, data);
        } else if(iosPush){
          if(args.pushIos) {
            exports.pushIos(message, user.IOSToken, 1);
            log("Send push to "+user.name)
          } else {
            log("PUSH NOT SENT TO "+user.name+" Enable PUSH WITH 'node app pushIos'")
          }
          
        }
        break;
    }
  });
}