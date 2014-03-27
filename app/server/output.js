/*
  Wrappers for push, sms and socket output
*/
var 
  utils    = require('./utilities.js'),
  log      = utils.log,
  logError = utils.logError,
  logI     = utils.logImportant,
  args = require('./args.js'),
  config = ((args.dev) ? require('./../../configDev.json') : require('./../../config.json')),
  exports  = module.exports,
  users    = require('./users.js'),
  async    = require('async'),
  apn      = require('apn'),
  args     = require('./args.js'),
  store    = require('./redisStore.js').store;

////////////////////////////////////////////////////////////////////////////////
//        PUSH IOS
////////////////////////////////////////////////////////////////////////////////
var pushIos = (function(){
  
  var apnConnection = new apn.Connection({
    key: __dirname + '/key.pem',
    cert: __dirname + '/cert.pem',
    "gateway": "gateway.sandbox.push.apple.com",
    'address':"gateway.sandbox.push.apple.com"
  });

  var feedback = new apn.Feedback({
      "batchFeedback": true,
      "interval": 300
  });

  feedback.on("feedback", function(devices) {
    console.log(devices);
      // devices.forEach(function(item) {
      //  console.log(item);
      //     // Do something with item.device and item.time;
      // });
  });

  return (function(msg, token, hoursToExpiration) {
      if(!msg || !token) return;
  
      var myDevice = new apn.Device(token);
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600*hoursToExpiration;
      note.badge = 3;
      note.sound = "ping.aiff";
      note.alert = "Beacon Data";
      note.payload = {'messageFrom': 'Beacon'};
  
      apnConnection.pushNotification(note, myDevice);
    })
})();

////////////////////////////////////////////////////////////////////////////////
// TWILIO
////////////////////////////////////////////////////////////////////////////////
exports.sendSms = (function(){
        
  var twilio = require('twilio');
  var client = new twilio.RestClient(config.TWILIO.SID, config.TWILIO.TOKEN);
  
  var twilioNumbers = [
    '+13476255694',
    '+14123301599',
    '+14123301653',
    '+14123301648',
  ];
  return function(user, msg) {
      if (args.sendSms) {
        log("SENT SMS To "+user.name, msg);
      } else {
        log("SMS NOT SENT TO '"+user.name+"' ENABLE SMS WITH 'node app sendSms'");
        return;
      }

    client.sms.messages.create({
      to:   user.pn,
      from: twilioNumbers[0],
      body: msg
    },
    function(error, message) {
      if (error) logError(error);
      // else log('sent sms to', user.name);
    });
  }
})();

// exports.sendSms({pn:'+13475346100'},'heyhey\nextraFizzy.com')
////////////////////////////////////////////////////////////////////////////////
// EMIT 
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
  //   recipients: '[user]'
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
        if (users.isConnected(user.uid)) {
          io.sockets.in(user.uid).emit(eventName, data);
        } else if (sms && args.sendSms) {
          sendSms(user, sms);
          log("SENT SMS To "+user.name);
        } else if(sms){
          log("SMS NOT SENT TO '"+user.name+"' ENABLE SMS WITH 'node app sendSms'");
        }
        break;

      case "Guest":
        if (users.isConnected(user.uid)) {
          io.sockets.in(user.uid).emit(eventName, data);
        } else if (sms) {
          sendSms(user, message);
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