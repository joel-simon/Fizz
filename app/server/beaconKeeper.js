var Beacon = require('./server-beacon.js');

function BeaconKeeper(store) {
  this.store = store;
}


BeaconKeeper.prototype.insert = function(B, callback) {
  var self = this;
  if (B.pub) insertPublic(B); 
  else insertPrivate(B);

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
  console.log(arguments);
  this.store.sadd('a'+hostId, guestId, callback);
}

BeaconKeeper.prototype.del_guest = function(hostId, guestId, callback) {
  this.store.srem('a'+hostId, guestId, callback);
}



// returns null on failure
BeaconKeeper.prototype.get = function(userId, callback) {
  // console.log('gert');
  var store = this.store
  store.hget('privateBeacons', userId, function(err, bString) {
    if (err) return callback(err);
    if (!bString) return callback(null, null)
    store.smembers('a'+userId, function(err, members){
      var b = JSON.parse(bString);
      b.attends = members;
      callback(err, b);
    });
  });
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
          console.log(beacons);
          self.getPublic(function(err, pubs) {
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
  self.getPublic(cont);
  self.getPrivate(cont);

  function cont(err, newArr) {
    if (err) return callback(err);
    arr = arr.concat(newArr);
    if (++recieved === total) callback(null, arr);
  }

}
BeaconKeeper.prototype.getPrivate = function(callback) {
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
BeaconKeeper.prototype.getPublic = function(callback) {
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