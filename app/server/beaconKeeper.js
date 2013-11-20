var Beacon = require('./server-beacon.js');

function BeaconKeeper(store) {
  this.store = store;
}


BeaconKeeper.prototype.insert = function(B, callback) {
  var self = this;
  if (B.pub) insertPublic(B); 
  else insertPrivate(B);

  function insertPublic (B) {
    self.store.sadd('publicBeacons', JSON.stringify(B), done);
  }
  function insertPrivate (B) {
    var q = [B.host, "host", B.host, "lat", B.lat, "lng", B.lng,
     "desc", B.desc, "title", B.title];
    self.store.hmset(q, done);
  }
  function done() {
    if (callback) callback (null);
  }
}


BeaconKeeper.prototype.remove = function(userId, callback) {
  this.store.del(userId, function(){});
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
  store.hexists(userId, 'host', function(err, exists){
    if (err) return callback(err)
    if (!exists) return callback(null, null);

    store.hgetall(userId, function(err, b) {
      if(err || !b) return callback(err, null);
      store.smembers('a'+userId, function(err, members){

        b.attends = members;
        if(!callback) console.trace();
        callback(err, b);
      });
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
          // callback(err, beacons);
          self.store.smembers('publicBeacons', function(err, pubs) {
            // callback(err, beacons);
            callback(err, beacons.concat(pubs.map(JSON.parse)));
            // console.log(err, beacons.map(JSON.parse));
          });
        }
            
      });
    }
  })();
}

BeaconKeeper.prototype.clearPublic = function() {
  this.store.del('publicBeacons', redis.print);
}


module.exports = BeaconKeeper;