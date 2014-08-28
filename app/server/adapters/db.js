var pg = require('pg');
var config = require('./../config')
var dbstring = config.DB.POSTGRES_URL

var utils   = require('./../utilities.js');
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
	if (typeof(text) !== 'string')
    return cb('Invalid db.query params. text:'+text);
	if (! Array.isArray(values))
    return cb('Invalid db.query params. values:'+values);
	if (typeof(cb) !== 'function')
    return cb('Invalid db.query params. cb:'+cb);
	
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

exports.transaction = function(main, cb) {
  pg.connect(dbstring, function(err, client, done) {
    if (err) return cb(err);
    client.query('BEGIN', function(err) {
      process.nextTick( function() {
        main(function(err, results) {
          if (err) {
            rollback(client, done);
            return cb (err)
          } else {
            client.query('COMMIT', done);
            return cb(null);
          }
        }) 
      });
    });
  });
}

