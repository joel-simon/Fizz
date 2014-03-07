var async = require('async');
var sanitize = require('validator').sanitize;
var store = require('./redisStore.js');
exports = module.exports;

/**
 * BeaconKeeper is the class for managing all the beacons that the server hold.
 * As of now it is an abstraction wrapper for dealing with redis where current
 * beacons live.
 *
 * @param {Object} Store - takes a redis conenction object
 */
exports.add = function(event, callback) {
  var self = this;
  var eid;
  store.hincrby('idCounter', 'event', 1, function(err, next) {
    if (err) return callback(err);
    event.eid = next;
    event.message.eid = next;
    async.parallel({
      message: function(cb) {
        if (event.message) exports.addMessage(event.message, cb);
      },
      guestList: function(cb) {
        exports.addGuest(event.eid, event.host, cb);
      },
      inviteList: function(cb) {
        store.sadd('inviteList:'+event.eid, event.inviteList.map(JSON.stringify),cb);
      },
      makeVisisble: function(cb) {
        async.map(event.inviteList, function(user, cb2) {
           store.sadd('viewableBy:'+user.uid, event.eid, cb2);
        }, cb);
      },
      setHost: function(cb) {
        var data = JSON.stringify({host:event.host});
        store.hset('events', event.eid, data, cb)
      }
    },
    function(err, results) {
      if(err) return callback(err);
      callback(null, event.eid);
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
    host: function(cb) {
      store.hget('events', eid, cb);
    }
  },
  function(err, results) {
    // console.log(results.messages);
    if(err) return callback(err);
    var event = {'eid' : eid};
    event.host = JSON.parse(results.host).host;
    event.messageList = results.messages.map(JSON.parse);
    event.inviteList = results.inviteList.map(JSON.parse);
    event.guestList = results.guestList;
    callback(null, event);
  });
}

exports.addGuest = function(eid, uid, callback) {
  store.sadd('guestList:'+eid, uid, callback);
}

exports.removeGuest = function(eid, uid, callback) {
  store.srem('guestList:'+uid, eid, callback);
}

exports.addMessage = function(msg, callback) {
  // msg.text = sanitize(msg.text).xss();
  store.hincrby('idCounters', 'message', 1, function(err, i) {
    if (err) return callback(err);
    msg.mid = i;
    store.rpush('messages:'+msg.eid, JSON.stringify(msg), function(err) {
      callback(err, i);
    });
  });
}

exports.getInviteList = function(eid, cb) {
  store.smembers('inviteList:'+eid, function(err, list) {

    if (err) cb(err);
    else cb(null, list.map(JSON.parse));
  });
}



exports.isInvitedTo = function(uid, callback) {
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


exports.addVisible = function(user, event, callback) {
  store.sadd('viewableBy:'+user.uid, event.eid, callback);
}

exports.deleteVisible = function(userId, bId, callback) {
  store.srem('viewableBy:'+userId, bId, callback);
}

// exports.updateFields = function (data, callback) {
//   var self = this;
//   exports.get(data.id, function(err, b) {
//     for (var e in data) {
//       if (b.hasOwnProperty(e)) {
//         b[e] = data[e];
//       }
//     }
//     exports.insert(b, function(err) {
//       if (err) callback(err);
//       else callback(null);
//     });
//   });
// }



// exports.remove = function(id, host, callback) {
//   // store.hdel('privateBeacons', ''+id, function(){});
//   async.parallel({
//       beacon:    function(cb){ store.hdel('publicBeacons', ''+id, cb) },
//       comments:  function(cb){ store.del('comments'+id, cb) },
//       attending: function(cb){ store.del('a'+id, callback) },
//       hostedBy:  function(cb){ store.srem('hostedBy'+host, id) }
//     },
//     function(err, results) {
//       callback(err);
//     }
//   );
// }
