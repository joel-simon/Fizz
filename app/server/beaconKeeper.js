var async = require('async');
var validate = require('./utilities').validate;
var sanitize = require('validator').sanitize;
var store = require('./redisStore.js');
exports = module.exports;
// var config  = require('./../../config.json');
// var redis   = require('redis');
// var rtg  = require("url").parse(config.DB.REDISTOGO_URL);   
// var store = redis.createClient(rtg.port, rtg.hostname);
// store.auth(rtg.auth.split(":")[1], function(err) {if (err) throw err});
/**
 * BeaconKeeper is the class for managing all the beacons that the server hold.
 * As of now it is an abstraction wrapper for dealing with redis where current
 * beacons live. 
 * 
 * @param {Object} Store - takes a redis conenction object
 */

/**
 * BeaconKeeper is the class for managing all the beacons that the server hold.
 * As of now it is an abstraction wrapper for dealing with redis where current
 * beacons live. 
 * 
 * @param {Object} B - the beacon to insert
 */
exports.insert = function(B, callback) {
  var self = this;
  var key;

  if (validate(B)) {
    key = 'hostedBy'+B.host;
    (B.pub) ? insertPublic(B) : insertPrivate(B);
    if (B.comments.length > 0) {
      var c = B.comments[0];
      exports.addComment(B.id, c.user, c.comment);
    }
  } else if (callback) {
    return callback("Invalid Beacon.");
  }

  function insertPublic (B) {
    store.hset('publicBeacons', B.id, JSON.stringify(B), done);
    store.sadd(key, B.id);
  }
  function insertPrivate (B) {
    store.hset('privateBeacons', B.id, JSON.stringify(B),  done);
    store.sadd(key, B.id);
  }
  function done(err) {
    if (err) callback(err);
    else if (callback) callback (null);
  }
}

exports.getNextId = function(callback) {
  store.incr('beaconCounter', callback);
}

exports.remove = function(id, host, pub, callback) {
  store.hdel('privateBeacons', ''+id, function(){});
  store.hdel('publicBeacons', ''+id, function(){});
  store.del('comments'+id, function(){});
  store.del('a'+id, callback);
  store.srem('hostedBy'+host, id); 
}

exports.add_guest = function(id, guestId, callback) {
  store.sadd('a'+id, guestId, callback);
}

exports.del_guest = function(id, guestId, callback) {
  store.srem('a'+id, guestId, callback);
}

exports.addComment = function(id, guestId, comment, callback) {
  var c = sanitize(comment).xss();
  store.hincrby('addCommentIds', id, 1, function(err, i) {
    if (err) return callback(err);
    var commentObj = {'user':guestId, 'comment':c, 'id':i};
    store.rpush('comments'+id, JSON.stringify(commentObj), function(err) {
      if (callback) callback(err, commentObj)
    });
  }); 
}

exports.getComments = function(id, callback) {
  store.lrange('comments'+id,0,-1, function(err, data) {
    if (err) callback (err);
    else { 
      // console.log('comments', data);
      // callback(null, data);
      callback(null, data.map(function(e){return JSON.parse(e)}));
    }
  });
}

exports.updateFields = function (data, callback) {
  var self = this;
  exports.get(data.id, function(err, b) {
    for (var e in data) {
      if (b.hasOwnProperty(e)) {
        b[e] = data[e];
      }
    } 
    exports.insert(b, function(err) {
      if (err) callback(err);
      else callback(null);
    });
  });
}

exports.isValidId = function(bId, callback) {
  store.hexists('privateBeacons', bId, function(err, is){
    if(is) callback(null, true);
    else callback(null, false);
  });
}

// returns null on failure
exports.get = function(id, callback) {
  var self = this;
  store.hexists('publicBeacons', id, function(err, isIn) {
    if(err) return callback(err);
    if (isIn == 1) {
      g('publicBeacons');
    } else {
      store.hexists('privateBeacons', id, function(err, isIn) {
        if (err) return callback(err);
        if (isIn == 1) {
          g('privateBeacons');
        } else {
          callback(null, null);
        }
      });
    }
  });

  function g(hash) {
    async.parallel({
      data: function(cb){
        store.hget(hash, id, function(err, bString) {
          if (err)      return cb(err);
          if (!bString) return cb(null, null);
          else cb(null, JSON.parse(bString));
        });
      },
      attends: function(cb){
        store.smembers('a'+id, function(err, members) {
          if (err) return cb (err);
          else     return cb (null,members);
          cb(err, b);
        });
      },
      comments: function(cb){
        exports.getComments(id, cb);
      } 
    },
    function(err, results) {
      if(err) return callback(err);
      var B = results.data;
      B.comments = results.comments;
      B.attends = results.attends;
      callback(null, B);
    });
  }
}


// returns null on failure
// exports.getVisible = function(friends, userId, callback) {
//   var beacons = [];
//   var self = this;
//   friends.push(userId);
//   var responses = 0;
//   for (var i = 0; i < friends.length; i++) (function(f) {
//     exports.store.smembers('hostedBy'+f, function(err, data) {
//       if (data.length>0) {
//         foo(data, function(err, bcns) {
//           beacons = beacons.concat(bcns);
//           // console.log(responses, friends.length);
//           if ((++responses) == friends.length) {
//             callback(null, beacons);              
//           }
//         });
//       } else {
//         responses++;
//       }
//     });
//   })(friends[i]);

//   function foo(d, cb) {
//     var bcns = [];
//     var c = 0;
//     for (var i = 0; i < d.length; i++) {
//       exports.get(d[i], function(err, b) {
//         if (err) return callback(err);
//         bcns.push(b);
//         if ((++c) == d.length) {
//           cb(null, bcns);              
//         }
//       });
//     }
//   }
// }
/*
  the admin calls this to get everything
*/
exports.getAll = function(callback) {
  var recieved = 0,
      total = 2,
      arr = [],
      self = this;

  if (!callback) return null;
  exports.getAllPublic(cont);
  exports.getAllPrivate(cont);

  function cont(err, newArr) {
    if (err) return callback(err);
    arr = arr.concat(newArr);
    if (++recieved === total) callback(null, arr);
  }

}

exports.getAllPrivate = function(callback) {
  if (!callback) return null;

  store.hvals('privateBeacons', function(err, privates) {
    if (err) callback(err)
    else if (!privates || !privates.length)callback(err, []);
    else fillAttends(privates);
  });

  function fillAttends(bl) {
    var arraysRecieved = 0;
    for (var i = 0; i < bl.length; i++) (function(j) {
      var B = JSON.parse(bl[j]);
      store.smembers('a'+B.host, function(err, members) {
        if (err) return callback(err)
        B.attends = members;
        bl[j] = B;
        if (++arraysRecieved === bl.length) callback(null, bl);
      });
    })(i);
  }
}
exports.getAllPublic = function(callback) {
  if (!callback) return null;

  store.hvals('publicBeacons', function(err, publics) {
    if (err) callback(err)
    else if (!publics || !publics.length)callback(err, []);
    else fillAttends(publics);
  });

  function fillAttends(bl) {
    var arraysRecieved = 0;
    for (var i = 0; i < bl.length; i++) (function(j) {
      var B = JSON.parse(bl[j]);
      store.smembers('a'+B.host, function(err, members) {
        if (err) return callback(err)
        B.attends = members;
        bl[j] = B;
        if (++arraysRecieved === bl.length) callback(null, bl);
      });
    })(i);
  }
}

exports.clearPublic = function() {
  store.del('publicBeacons', redis.print);
}
