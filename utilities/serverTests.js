
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
      tests1();  
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
    d: function(cb){ users.getOrAddMember(danielFBProfile, danielToken, '+13016420019', 'iosToken', cb) },
    j: function(cb){ users.getOrAddMember(joelFBProfile, joelToken, '+13475346100', 'iosToken', cb) },
    a: function(cb){ users.getOrAddMember(andrewFBProfile, andrewToken, '+13107102956', 'iosToken', cb) },
  }, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      d = results.d;
      j = results.j;
      a = results.a;
      createEvents();
    }
  });
}

function createEvents() {  
  handler.newEvent({
    text: "Daniel's First Event",
    inviteOnly: true
  }, {handshake:{user:d}}); // MAKE THIS USER THE CREATOR, a, j or d

  // handler.newEvent({
  //   text: "Andrew's First Event",
  //   inviteOnly: true
  // }, {handshake:{user:a}}); // MAKE THIS USER THE CREATOR, a, j or d

  // handler.newEvent({
  //   text: "Joel's First Event",
  //   inviteOnly: true
  // }, {handshake:{user:j}}); // MAKE THIS USER THE CREATOR, a, j or d

  setTimeout(function(){
    inviteOneAnother();
  },500)
}

function inviteOneAnother() {

  // sendRequests();

  handler.invite({
    eid: 1,
    inviteList: [a],
    invitePnList: ['+13475346100'] // PUT THE PEOPLE TO INVITE (NOT HOSTS #)
  },{handshake:{user:d}}); // MAKE THIS USER THE CREATOR, a, j or d
  
  // setTimeout(function() {
  //   handler.invite({
  //     eid: 2,
  //     inviteList: [],
  //     invitePnList: ['+13016420019', '+13107102956', '+13475346100', '+13013358587'] // PUT THE PEOPLE TO INVITE (NOT HOSTS #)
  //   },{handshake:{user:a}}); // MAKE THIS USER THE CREATOR, a, j or d

  //   handler.invite({
  //     eid: 3,
  //     inviteList: [],
  //     invitePnList: ['+13016420019', '+13107102956', '+13475346100', '+13013358587'] // PUT THE PEOPLE TO INVITE (NOT HOSTS #)
  //   },{handshake:{user:j}}); // MAKE THIS USER THE CREATOR, a, j or d

  // }, 2000);
}

function sendRequests() {
  handler.request({eid: 1}, {handshake:{user:j}});
}

