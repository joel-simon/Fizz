var pg = require('pg');
// var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';
var dbstring = 'postgres://localhost/fizzdb';

var utils   = require('./utilities.js');
var log     = utils.log;
var logError = utils.logError;

pg.connect(dbstring, function(err, client, done) {
  if(!client) {
    logError('No Connection to Postgresql');
    throw ('No Connection to Postgresql');
  } 
});

function rollback(client, done) {
  client.query('ROLLBACK', function(err) {
    return done(err);
  });
}

exports.connString = dbstring;

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};
exports.query = function(text, values, cb) {
  if (!cb) {
    cb = values;
    values = [];
  }
	if (typeof(text) !== 'string') return cb('Invalid text:'+text);
	if (! Array.isArray(values)) return cb('Invalid values:'+values);
	if (typeof(cb) !== 'function') return cb('Invalid cb');
	
  pg.connect(dbstring, function(err, client, done) {
    client.query(text, values, function(err, result) {
      done();
      if (err) {
        err.text = (text.insert(err.position-1, '->'))
      }
      if(cb) {
        cb(err, result);
      } else {
        console.log('Call to db.query withouth a callback, very bad!!');
        console.trace();
      }
    })
  });
}

// exports.transaction = function(queries, cb) {
//   pg.connect(dbstring, function(err, client, done) {
//     if (err) return cb(err);
//     client.query('BEGIN', function(err) {
//       process.nextTick(function(){
//         async.eachSeries(queries, function(query, cb2) {
//           client.query(query.string, query.values, function())
//         });
//       });
//     });
//       function(cb) {},

//       function(cb) {client.query(q1, [ eid, uid ], cb) },
//       function(cb) {client.query(q2, [ eid ])}
//     ],
//     function(err, results) {
//       if (err) return rollback(client, done);
//       client.query('COMMIT', done);
//       return cb(null);
//     });
//   });
// }

