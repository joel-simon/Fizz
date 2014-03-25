var async = require('async');
var sanitize = require('validator').sanitize;
var store = require('./redisStore.js').store;
exports = module.exports;

/*
  REDIS VARIABLES

  idCounters      | event->int, message->int
  viewableBy:uid  | set(eid)

  inviteList:eid  | set(users) 
  event:uid       | seats->int
                    inviteOnly -> boolean
                    creator -> uid
                    requests-> uid list
  messages:eid    | list(json message)
  guestList:eid   | list(uid)
*/

  // users.addVisibleList([user], result.e.eid, function(err) {
  //     if (err) logError(err);
  //   });

exports.addVisibleList = function(users, eid, cb) {
  async.each(users, function(u, cb2) {
    exports.addVisible(u.uid, eid, cb2);
  }, cb);
}
exports.addVisible = function(uid, eid, callback) {
  store.sadd('viewableBy:'+uid, eid, callback);
}

/**
 *
 */
exports.add = function(text, user, FUL, inviteOnly, callback) {
  var self = this;
  // console.log(FUL);
  var e = {
    eid: 0,
    creator: user.uid,
    guestList: [user.uid],
    inviteList: inviteOnly ? [user] : FUL.concat(user),
    seats: 2,
    inviteOnly: inviteOnly,
    messageList: null,
    seats:2,
    requests: []
  };
  store.hincrby('idCounter', 'event', 1, function(err, next) {
    if (err) return callback(err);
    e.eid = next;
    async.parallel([
      function(cb) { // add first message.
        exports.addMessage(e.eid, user.uid, text, cb);
      },
      function(cb) { //add creator to guestlist
        store.sadd('guestList:'+e.eid, user.uid, cb);
      },
      function(cb){ // show event to creator
        exports.addVisible(user.uid, e.eid, cb);
      },
      function(cb) { // add creator to invite list
        store.sadd('inviteList:'+e.eid, JSON.stringify(user), cb);
      },
      function(cb) {
        if (inviteOnly) {
          cb(null);
        } else {
          async.each(FUL, function(u, cb2){
            exports.addVisible(u.uid, e.eid, cb2);
          }, cb);
        }
      },
      function(cb) {
        store.set('event:'+e.eid,JSON.stringify({
          'eid' : e.eid,
          'seats': e.seats, 
          'inviteOnly': e.inviteOnly,
          'creator': e.creator,
          }), cb);
      }
    ],
    function(err, results) {
      if(err) return callback(err);
      e.messageList = [results[0]];
      callback(null, e);
    });

  });
}

// returns null on failure
exports.get = function(eid, callback) {
  var eid = +eid;
  var self = this;

  async.parallel({
    messages: function(cb) {
      store.lrange('messages:'+eid, 0, -1, cb);
    },
    guestList: function(cb) {
      store.smembers('guestList:'+eid, function(err, strings){
        var nums = strings.map(function(s){return(+s)});
        cb(err, nums);
      });
    },
    inviteList: function(cb) {
      store.smembers('inviteList:'+eid, cb);
    },
    event: function(cb) {
      store.get('event:'+eid, cb);
    }
  },
  function(err, results) {
    if(err) return callback(err);

    var event = JSON.parse(results.event);//{'eid' : eid};
    // event.seats = +results.event[0];
    // event.inviteOnly = JSON.parse(results.event[1]);
    // event.creator = results.event[2];

    event.messageList = results.messages.map(JSON.parse);
    event.inviteList = results.inviteList.map(JSON.parse);
    event.guestList = results.guestList;
    callback(null, event);
  });
}

exports.addGuest = function(eid, uid, callback) {
  store.hget('event:'+eid, 'seats', function(err, seats){
    if (err) callback(err);
    else if (seats>1) store.sadd('guestList:'+eid, uid, callback);
  });
}

exports.removeGuest = function(eid, uid, cb) {
  store.srem('guestList:'+eid, uid, cb);
}

exports.addMessage = function(eid, uid, text, callback) {
  // text = sanitize(msg.text).xss();
  store.hincrby('idCounters', 'message', 1, function(err, i) {
    if (err) return callback(err);

    var msg = {
      text: text,
      mid: i,
      eid: eid,
      uid: uid,
      creationTime: Date.now()
    }
    // check.is(msg, 'message');
    store.rpush('messages:'+eid, JSON.stringify(msg), function(err) {
      if (err) callback(err) 
      else callback(null, msg);
    });
  });
}

exports.getInviteList = function(eid, cb) {
  store.smembers('inviteList:'+eid, function(err, list) {
    if (err) cb(err);
    else cb(null, list.map(JSON.parse));
  });
}

exports.canSee = function(uid, callback) {
  store.smembers('viewableBy:'+uid, function(err1, eidList) {
    if (err1) return callback(err);
    if (eidList.length === 0) callback(null, []);
    else {
      async.map(eidList, exports.get, function(err2, eventList) {
        if(err2) callback(err2);
        else callback(null, eventList);
      });
    }
  });
}

exports.addInvitees = function(eid, users, cb) {
  store.sadd('inviteList:'+eid, users.map(JSON.stringify),function(err){
    async.each(users, function(user, cb2) {
      exports.addVisible(user.uid, eid, cb2);
    }, cb);
  });
}

exports.setSeatCapacity = function(eid, seats, cb) {
  store.hset('event:'+eid, 'seats', seats, cb);
}
