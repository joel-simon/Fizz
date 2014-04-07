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
  phoneManager = require('./phoneManager.js'),
  async    = require('async'),
  apn      = require('apn'),
  args     = require('./args.js');
  // store    = require('./redisStore.js').store;
module.exports = exports;
////////////////////////////////////////////////////////////////////////////////
//        PUSH IOS
////////////////////////////////////////////////////////////////////////////////
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
  });
exports.pushIos = function(msg, user, hoursToExpiration) {
  
  var mainLog = "Sending push to "+user.name +'\n\t\tmsg:'+msg+
                '\n\t\ttoken:'+user.iosToken;
  
  
  if (!args.pushIos)
    return log(mainLog, "Status: FAILED! Enable PUSH WITH 'node app pushIos'")

  if(user.iosToken == 'iosToken')
    return log(mainLog, 'Status: FAILED! Token is fake as shit.');
  if (!msg)
    return log(mainLog, 'Status: FAILED! MSG is bad:'+msg);

  users.getIosToken(user.uid, function(err, iosToken) {
    // log('TOKEN:'+iosToken);
    if(err) return logError(err)
    if(!iosToken) return logError('No token found for'+JSON.stringify(user));
    try{
      var myDevice = new apn.Device(iosToken);
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600*hoursToExpiration;
      note.badge = 3;
      note.sound = "ping.aiff";
      note.alert = msg;
      note.payload = {'messageFrom': 'Fizz'};
  
      apnConnection.pushNotification(note, myDevice);
    } catch(e) {
      return log(mainLog, "Status: FAILED.",'ERR:'+e,'Token:'+iosToken);
    }
    log(mainLog, "Status: Success.'")
  });
}


////////////////////////////////////////////////////////////////////////////////
// TWILIO
////////////////////////////////////////////////////////////////////////////////
var twilio = require('twilio');
var client = new twilio.RestClient(config.TWILIO.SID, config.TWILIO.TOKEN);
  
exports.sendSms = function(user, eid, msg) {
  phoneManager.getPn(user, eid, function(err, pn) {
    if (err) return logError(err);

    if (args.sendSms) {
      log("SENT SMS To:"+user.name+'. On number:'+pn+
          '\n\t\tMessage:'+JSON.stringify(msg));
    } else {
      log("SMS NOT SENT To:"+user.name+'. On number:'+pn+
          '\n\t\tMessage:'+JSON.stringify(msg));
      // log("SMS NOT SENT '"+msg+"' To "+pn+ "ENABLE SMS WITH 'node app sendSms'");
      return;
    }
    client.sms.messages.create({
      to:   user.pn,
      from: pn,
      body: msg
    },
    function(error, message) {
      if (error) logError(error);
    });
  });
}

exports.sendGroupSms = function(userList, eid, msgFun) {
  async.each(userList,
    function(u, cb) {
      if (!u.type == 'Phone') return cb(null);
      exports.sendSms(u, eid, msgFun(u));
      cb();
    },
    function(err) {
      if(err) logError(err);
    }
  );
}

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

// var foo='BC45506F3DD570B9C51363068DFBEF0FE178B7F7318D3CA7485F6040F980B74A'
// exports.emit({
//   eventName:'foo',
//   data: 'foo',
//   recipients:
// })
console.log(utils);
log('test')
var io;
exports.emit = function(options) {
  var 
    eventName  = options.eventName,
    data       = options.data,
    recipients = options.recipients,
    iosPush    = options.iosPush || null
    pushRecipients = options.pushRecipients;

  // Deal with a circular dependency by delaying invocation.
  if(!io) io = require('../../app.js').io;
  log('Emitting '+eventName,
      'to:'+JSON.stringify(recipients.map(function(u){return u.name+':'+u.type})),
      'data:' + JSON.stringify(data)
      );

  async.each(recipients, function(user, callback) {
    if (users.isConnected(user.uid)) {
      io.sockets.in(user.uid).emit(eventName, data);
    } 
    if ( iosPush && user.type === "Member" && (!pushRecipients ||
                pushRecipients.indexOf(user.uid) !== -1)) {
      exports.pushIos(iosPush, user, 1);
    }
  });
}