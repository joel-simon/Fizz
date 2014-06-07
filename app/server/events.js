var async = require('async');
var sanitize = require('validator').sanitize;
var store = require('./redisStore.js').store;
var users = require('./users.js');
exports = module.exports;
var db = require('./db.js');

var pg = require('pg');
var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';

var rollback = function(client, done) {
  client.query('ROLLBACK', function(err) {
    return done(err);
  });
};


exports.add = function(user, text, callback) {
  var q1 = "INSERT INTO events (creator, clusters) VALUES ($1, $2) RETURNING eid, creation_time";
  var q2 = "INSERT INTO messages (mid, eid, uid, data) VALUES ($1, $2, $3, $4)";
  var q3 = "INSERT INTO invites (eid, uid, inviter, confirmed, accepted) VALUES ($1, $2, $3, $4, $5)";
  var eid, creationTime; 
  pg.connect(dbstring, function(err, client, done) {
    if (err) return callback(err);
    async.waterfall([
      function(cb) {client.query('BEGIN', cb)},
      function() {process.nextTick(arguments[arguments.length-1])},
      function() {client.query(q1, [ user.uid, '{}' ], arguments[arguments.length-1]) },
      function(result, cb) {
        eid = result.rows[0].eid;
        creationTime = Date.parse(result.rows[0].creation_time);
        client.query(q2, [ 1, eid, user.uid, text ], cb)
      },
      function() {
        client.query(q3, [eid, user.uid, user.uid, true, true], arguments[arguments.length-1])
      }
    ],
    function(err, results) {
      if (err) {
        rollback(client, done);
        callback(err);
      } else {
        client.query('COMMIT', done);
        return callback(null, {eid:eid, creationTime:creationTime});
      }
    });
  });
}

// returns null on failure
exports.get = function(eid, callback) {
  var eid = +eid;
  var q1 = "SELECT * FROM events WHERE events.eid = $1";
  db.query(q1, [eid], function(err, result) {
    if (err) callback (err);
    else callback(null, result.rows[0]);
  });
}

exports.join = function(eid, uid, callback) {
  var q1 = "UPDATE invites SET accepted = true, accepted_time = NOW() "+
        "WHERE eid = $1 and uid = $2";
  var q2 = "UPDATE events SET last_accepted_update = NOW() where eid = $1";

  pg.connect(dbstring, function(err, client, done) {
    if (err) return callback(err);
    async.series([
      function(cb) {client.query('BEGIN', cb)},
      function(cb) {process.nextTick(cb)},
      function(cb) {client.query(q1, [ eid, uid ], cb) },
      function(cb) {client.query(q2, [ eid ], cb)}
    ],
    function(err, results){
      if (err) {
        rollback(client, done);
        callback(err)
      } else {
        client.query('COMMIT', done);
        callback(null);
      }
    });
  });
}

exports.leave = function(eid, uid, callback) {
  var q1 = "UPDATE invites SET accepted = false, accepted_time = NOW() "+
        "WHERE eid = $1 and uid = $2";
  var q2 = "UPDATE events SET last_accepted_update = NOW() where eid = $1";

  pg.connect(dbstring, function(err, client, done) {
    if (err) return logError(err);
    async.series([
      function(cb) {client.query('BEGIN', cb)},
      function(cb) {process.nextTick(cb)},
      function(cb) {client.query(q1, [ eid, uid ], cb) },
      function(cb) {client.query(q2, [ eid ], cb)}
    ],
    function(err, results){
      if (err) {
        rollback(client, done);
        callback(err)
      } else {
        client.query('COMMIT', done);
        callback(null);
      }
    });
  });
}

exports.addMessage = function(eid, uid, text, callback) {
  // text = sanitize(msg.text).xss();
  store.hincrby('messages', ''+eid, 1, function(err, mid) {
    if (err) return callback(err);
    var q2 = "INSERT INTO messages (mid, eid, uid, data) VALUES ($1, $2, $3, $4)";
    db.query(q2, [mid+1, eid, uid, text], callback);
  });
}

exports.getMoreMessages = function(eid, mid, cb) {
  var q1 = "SELECT * FROM messages WHERE eid = $1 and mid > $2 ORDER BY creation_time LIMIT 10";
  db.query(q1, [eid, mid], function(err, results) {
    if (err) cb(err);
    else cb(null, results.rows);
  });
}
exports.getInviteList = function(eid, cb) {
  var q = "SELECT (users.uid, pn, name, fbid, accepted) FROM users, invites WHERE invites.eid = $1 and users.uid = invites.uid";
  db.query(q, [eid], function(err, result) {
    if (err) cb(err);
    else cb(null, result.rows);
  });
}


exports.addInvites = function(eid, inviter, users, confirmed, cb) {
  var q = "insert into invites (eid, uid, inviter, confirmed) values ";
  var values = [];
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    values=values.concat('('+([eid,u.uid,inviter,confirmed].join(','))+')');
  }
  db.query(q+(values.join(',')),[], cb);
}



