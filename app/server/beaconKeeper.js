var Beacon = require('./server-beacon.js');

function BeaconKeeper(store) {
  this.store = store;
}

BeaconKeeper.prototype.insert = function(B) {
  var q = [B.host, "host",B.host,"lat",B.lat, "lng",B.lng, "desc",B.desc, "title",B.title];
  this.store.hmset(q, redis.print);
}

BeaconKeeper.prototype.remove = function(userId) {
  this.store.del(userId, redis.print);
  this.store.del('a'+userId, redis.print);
}

BeaconKeeper.prototype.add_guest = function(hostId, guestId) {
  this.store.sadd('a'+hostId, guestId, redis.print);
}

BeaconKeeper.prototype.del_guest = function(hostId, guestId) {
  this.store.srem('a'+hostId, guestId, redis.print);
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
        callback(err, b);
      });
    });

  });
}

// returns null on failure
BeaconKeeper.prototype.getAllFriends = function(friends, userId, callback) {
  var beacons = [];
  friends.push(userId);
  for (var i = 0; i < friends.length; i++) {
    this.get(friends[i], function(err, b) {
      if (!err && b) {
        beacons.push(b);
      };
    });
  }
  callback(null, beacons);
}


module.exports = BeaconKeeper;