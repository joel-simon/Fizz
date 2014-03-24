
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');
var store = require('../app/server/redisStore.js').store;
var db = require('../app/server/dynamo.js');
var async    = require('async');
store.flushdb();
var a, d, j;
function onErr(err){if (err) throw err;};

beforeTests();

function beforeTests() {
  async.parallel([
    function(cb){users.delete(1, cb)},
    function(cb){users.delete(2, cb)},
    function(cb){users.delete(3, cb)},
    
  ], function(err){
    if (err) {
      console.log(err);
    } else {
      users.getOrAddPhone('+3107102956', function(err){
        if (err) return console.log(err);
        tests1();  
      });
    }
  });
}

function tests1(){
  var andrewFBProfile = {
    id: '100000157939878',
    displayName: 'Andrew Sweet'
  }
  var joelFBProfile = {
    id: '1380180579',
    displayName: 'Joel Simon'
  }
  var danielFBProfile = {
    id: '798172051',
    displayName: 'Daniel Belchamber'
  }
  async.parallel({
    a: function(cb){ users.getOrAddMember(andrewFBProfile, 'fBToken', '+3107102956', 'iosToken', cb) },
    d: function(cb){ users.getOrAddMember(danielFBProfile, 'fBToken', '+13016420019', 'iosToken', cb) },
    j: function(cb){ users.getOrAddMember(joelFBProfile, 'fBToken', '+13475346100', 'iosToken', cb) }
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      a = result.a;
      j = result.j;
      d = result.d;
      addFriends();
    }
  });
}
function addFriends() {
  console.log('Adding friends.');
  users.addFriendList(a, [''+j.uid, ''+d.uid], function(err) {
    if (err) return console.log(err);
    users.addFriendList(j, [''+a.uid, ''+d.uid], function(err) {
      if (err) return console.log(err);
        users.addFriendList(d, [''+a.uid, ''+j.uid], function(err) {
        if (err) return console.log(err);
        createEvents();
      });
    });
  });
}
function createEvents(){
  events.add('Andrew First Event', a, false, function(err, ae){
    if (err) return console.log(err);
    events.add('Joels first event', j, false, function(err, je){
      if (err) return console.log(err);
      events.add('Daniels first event', d, false, function(err, de){
      if (err) return console.log(err);
        addMessages(ae, je, de);
      });
    });
  });
}

function addMessages(ae, je, de) {
  //joel leaves a comment on andrews event.
  events.addMessage(ae.eid, j.uid, 'Joels comment on andrews event.', function(err){
    if (err) return console.log(err);
    events.addMessage(de.eid, a.uid, 'Andrews comment on daniels event.', function(err){
      if (err) return console.log(err);
      events.addMessage(je.eid, d.uid, 'Daniels comment on joels event.', function(err){
        if (err) return console.log(err);
        afterTests();
      });
    });
  });
}

function afterTests() {
  console.log('Completed tests.');
}
