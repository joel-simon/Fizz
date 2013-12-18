var Beacon = require('./server-beacon.js');


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

/** Verify  a beacon. w
 * 
 * @param {Object} B - the beacon to insert
 * @return {Bool} - 
 */
function validate (b) {
  if (!b.host || typeof (+b.host) != 'number') return false;
  if (!b.lat  || !b.lng) return false;
  if (!b.desc || typeof b.desc != 'string') return false;
  if (!(b.attends && b.attends instanceof Array)) return false;

  return true;
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
  if (validate(B)) {
    (B.pub) ? insertPublic(B) : insertPrivate(B);
  } else if (callback) {
    return callback("Invalid Beacon.");
  }

  function insertPublic (B) {
    self.store.hset('publicBeacons', B.host, JSON.stringify(B), done);
  }
  function insertPrivate (B) {
     self.store.hset('privateBeacons', B.host, JSON.stringify(B),  done);
  }
  function done(err) {
    if(err) console.log('ERR:',err);
    if (callback) callback (null);
  }
}


BeaconKeeper.prototype.remove = function(userId, callback) {
  this.store.hdel('privateBeacons', ''+userId, function(){});
  this.store.hdel('publicBeacons', ''+userId, function(){});
  // this.store.del(userId, function(){});
  this.store.del('a'+userId, callback);
}

BeaconKeeper.prototype.add_guest = function(hostId, guestId, callback) {
  this.store.sadd('a'+hostId, guestId, callback);
}

BeaconKeeper.prototype.del_guest = function(hostId, guestId, callback) {
  this.store.srem('a'+hostId, guestId, callback);
}



// returns null on failure
BeaconKeeper.prototype.get = function(userId, callback) {
  var store = this.store;
  store.hexists('publicBeacons', userId, function(err, isIn) {
    if(err) return callback(err);
    if (isIn == 1) {
      g('publicBeacons', userId);
    } else {
      store.hexists('privateBeacons', userId, function(err, isIn) {
        if (err) return callback(err);
        if (isIn == 1) {
          g('privateBeacons', userId);
        } else {
          callback(null, null);
        }
      });
    }
  });

  function g(hash, id) {
    store.hget(hash, id, function(err, bString) {
      if (err) return callback(err);
      if (!bString) return callback(null, null)
      store.smembers('a'+userId, function(err, members) {
        var b = JSON.parse(bString);
        b.attends = members;
        callback(err, b);
      });
    });
  }
}


// returns null on failure
BeaconKeeper.prototype.getVisible = function(friends, userId, callback) {
  var beacons = [];
  var self = this;
  friends.push(userId);

  (function() {
    var responses = 0;
    for (var i = 0; i < friends.length; i++) {
      self.get(friends[i], function(err, b) {
        if (!err && b)
          beacons.push(b);
        if (++responses == friends.length) {
          self.getAllPublic(function(err, pubs) {
            if (err) return callback(err);
            callback(err, beacons.concat(pubs));
          });
        }
            
      });
    }
  })();
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