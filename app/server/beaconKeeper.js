var async = require('async');
var validate = require('./utilities').validate;
/**
 * BeaconKeeper is the class for managing all the beacons that the server hold.
 * As of now it is an abstraction wrapper for dealing with redis where current
 * beacons live. 
 * 
 * @param {Object} Store - takes a redis conenction object
 */
function BeaconKeeper(store) {
  this.store = store;
}


/**
 * BeaconKeeper is the class for managing all the beacons that the server hold.
 * As of now it is an abstraction wrapper for dealing with redis where current
 * beacons live. 
 * 
 * @param {Object} B - the beacon to insert
 */
BeaconKeeper.prototype.insert = function(B, callback) {
  var self = this;
  var store = self.store;
  var key;

  if (validate(B)) {
    key = 'hostedBy'+B.host;
    (B.pub) ? insertPublic(B) : insertPrivate(B);
    
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
    if(err) console.log('ERR:',err);
    if (callback) callback (null);
  }
}

BeaconKeeper.prototype.getNextId = function(callback) {
  this.store.incr('beaconCounter', callback);
}

BeaconKeeper.prototype.remove = function(id, host, pub, callback) {
  var store = this.store;
  store.hdel('privateBeacons', ''+id, function(){});
  store.hdel('publicBeacons', ''+id, function(){});
  store.del('comments'+id, function(){});
  store.del('a'+id, callback);
  store.srem('hostedBy'+host, id); 
}

BeaconKeeper.prototype.add_guest = function(id, guestId, callback) {
  this.store.sadd('a'+id, guestId, callback);
}

BeaconKeeper.prototype.del_guest = function(id, guestId, callback) {
  this.store.srem('a'+id, guestId, callback);
}

BeaconKeeper.prototype.addComment = function(id, guestId, comment, callback) {
  var entry = JSON.stringify({'id':guestId, 'comment':comment});
  this.store.rpush('comments'+id, entry);
}

BeaconKeeper.prototype.getComments = function(id, callback) {
  this.store.lrange('comments'+id,0,-1, callback);
}

// returns null on failure
BeaconKeeper.prototype.get = function(id, callback) {
  var self = this;
  var store = this.store;
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
        store.lrange('comments'+id,0,-1, cb);
      } 
    },
    function(err, results) {
      if(err) return callback(err);
      var B = results.data;
      B.comments = results.comments;
      B.attends = results.attends;
      // console.log(B);
      callback(null, B);
    });
  }
}

// returns null on failure
BeaconKeeper.prototype.getVisible = function(friends, userId, callback) {
  var beacons = [];
  var self = this;
  friends.push(userId);
  var responses = 0;
  for (var i = 0; i < friends.length; i++) (function(f) {
    self.store.smembers('hostedBy'+f, function(err, data) {
      if (data.length>0) {
        foo(data, function(err, bcns) {
          beacons = beacons.concat(bcns);
          // console.log(responses, friends.length);
          if ((++responses) == friends.length) {
            callback(null, beacons);              
          }
        });
      } else {
        responses++;
      }
    });
  })(friends[i]);

  function foo(d, cb) {
    var bcns = [];
    var c = 0;
    for (var i = 0; i < d.length; i++) {
      self.get(d[i], function(err, b) {
        if (err) return callback(err);
        bcns.push(b);
        if ((++c) == d.length) {
          cb(null, bcns);              
        }
      });
    }
  }
}
/*
  the admin calls this to get everything
*/
BeaconKeeper.prototype.getAll = function(callback) {
  var recieved = 0,
      total = 2,
      arr = [],
      self = this;

  if (!callback) return null;
  self.getAllPublic(cont);
  self.getAllPrivate(cont);

  function cont(err, newArr) {
    if (err) return callback(err);
    arr = arr.concat(newArr);
    if (++recieved === total) callback(null, arr);
  }

}

BeaconKeeper.prototype.getAllPrivate = function(callback) {
  var store = this.store;
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
BeaconKeeper.prototype.getAllPublic = function(callback) {
  var store = this.store;
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

BeaconKeeper.prototype.clearPublic = function() {
  this.store.del('publicBeacons', redis.print);
}





module.exports = BeaconKeeper;