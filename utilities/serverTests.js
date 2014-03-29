
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');
var store = require('../app/server/redisStore.js').store;
var db = require('../app/server/dynamo.js');
var async    = require('async');
var handler = require('../app/server/socketHandler.js');
store.flushdb();
var a, d, j;
function onErr(err){if (err) throw err;};

beforeTests();

function beforeTests() {
  async.parallel([
    function(cb){users.delete(1, cb)},
    function(cb){users.delete(2, cb)},
    function(cb){users.delete(3, cb)},
    function(cb){users.delete(4, cb)},
    function(cb){users.delete(5, cb)},
  ], function(err){
    if (err) {
      console.log(err);
    } else {
      // users.getOrAddPhone('+13107102956', function(err){
      // users.getOrAddPhone('+13475346100', function(err){
      //   if (err) return console.log(err);
        tests1();  
      // });
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

  var joelToken = 'CAAClyP2DrA0BAAAKbjBbA1ZAn4LRberdT90lJ81uZC3CotkOMnaezvDrc4HDQhI7ZBo1eSCwIurGruLpN4x70p9FHFRRT2405Jgoa8bbp1gbUa1WL8KPAUtRFx0PjdCEIVoCmzChtyKgEE5pDhMLpAzn1kGD1Ec5NwLgI6OjPgabiGCMKf2';
  var andrewToken= 'CAAGa4EJzl7kBAES8QjmOnURcDjMoZCO9B8o3sHGEwcEIcXri0rnQJR1XLcHhfbZAz33fxYjFzPeJrNochdeoxw45MjGIxghC0XgUHcQ6m0ZAXtxnXkLnSTy3M9Ams07ZAYkGbSa1pH2DZAzG0rp5Gk32USiSBMF2rQBNusV8lME0OKmXFbvH0rBDagzJuqUJrqP773AwO7sKCzGIAGTPn';
  var danielToken = 'CAAClyP2DrA0BAMPgkgfrXeZCJbEgbIehqZARtEDEmD2CtQqj6pqOW1XKY4p90FJLnxZBSZBTgZCYeNFikr3G8ByRtkCpCEYO8owEqEYJqjptXJvXIULQYHA6TQUgxCFtfuxfQEt0lSaK1pKshcOaizfbH68019WE4j3a3gDZAiZBaUI5oWLPT8ePFQgDe8upsAZD';
  async.series({
    // d: function(cb){ users.getOrAddMember(danielFBProfile, danielToken, '+13016420019', 'iosToken', cb) },
    j: function(cb){ users.getOrAddMember(joelFBProfile, joelToken, '+13475346100', 'iosToken', cb) },
    // a: function(cb){ users.getOrAddMember(andrewFBProfile, andrewToken, '+13107102956', 'iosToken', cb) }
    
    
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      // a = result.a;
      j = result.j;
      // d = result.d;
      // afterTests();
      createEvents();
      // addFriends();
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
function createEvents() {
  // console.log('Creating events.');
  
  handler.newEvent({
    text: 'Go to settings-> safari and turn on cookies to see this page!!',
    inviteOnly: true
  }, {handshake:{user:j}});

  setTimeout(function(){
    inviteOneAnother();
  },500)
  // events.add(, a, [j, d], true, function(err, ae){
  //   if (err) return console.log(err);
    // events.add('Joels first event', j, [d, j], false, function(err, je){
    //   if (err) return console.log(err);
    //   events.add('Daniels first event', d, [a, j], false, function(err, de){
    //   if (err) return console.log(err);
        // afterTests()
        // inviteOneAnother(ae, je, de);
      // });
  //   });
  // });
}

function inviteOneAnother() {

  handler.invite({
    eid: 1,
    inviteList: [],
    invitePnList: ['19494647070', '+13107102956', '+13016420019'] //'+13107102956', '+13475346100', 
  },{handshake:{user:j}});

  // console.log('Inviting one another.');
  // events.addInvitees(ae.eid, [j,d], function(err){
  //   if (err) return console.log(err);
  //   events.addInvitees(je.eid, [a, d], function(err){
  //     if (err) return console.log(err);
  //     events.addInvitees(de.eid, [a,j], function(err){
  //     if (err) return console.log(err);
  //       addMessages(ae, je, de);
  //     });
  //   });
  // });
}

function addMessages(ae, je, de) {
  // console.log('Leaving messages.');
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
  // console.log('Completed tests.');
}
