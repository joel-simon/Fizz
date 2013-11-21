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

    // var beaconData = [B.host, "host", B.host, "lat", B.lat, "lng", B.lng,
    //  "desc", B.desc, "title", B.title];
    // self.store.hmset(beaconData, done);

    // var query = ['privateBeacons', "host", B.host, "lat", B.lat, "lng", B.lng,
    //  "desc", B.desc, "title", B.title];
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

  // store.hexists('privateEvents', 'host', function(err, exists) {
  //   if (err) return callback(err)
  //   if (!exists) return callback(null, null)

  //   store.hgetall(userId, function(err, b) {
  //     if(err || !b) return callback(err, null);
  //     store.smembers('a'+userId, function(err, members){

  //       b.attends = members;
  //       if(!callback) console.trace();
  //       callback(err, b);
  //     });
  //   });
  // });
}
BeaconKeeper.prototype.getPublic 
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
        // console.log(responses, friends.length)
        if (++responses == friends.length) {
          console.log(beacons);
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
  if (!callback) return null;
  var self = this;
  self.store.hvals('privateBeacons', function(err, privates) {
    if (err) return callback(err)
    else callback(null, privates.map(JSON.parse));
  });
}
BeaconKeeper.prototype.getPublic = function(callback) {
  if (!callback) return null;
  var self = this;
  self.store.smembers('publicBeacons', function(err, privates) {
    if (err) return callback(err)
    else callback(null, privates.map(JSON.parse));
  });
}

BeaconKeeper.prototype.clearPublic = function() {
  this.store.del('publicBeacons', redis.print);
}


module.exports = BeaconKeeper;