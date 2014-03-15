
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');
var store = require('../app/server/redisStore.js').store;
store.flushdb();

var andrewProfile = {
  fbid: 100000157939878,
  type:'Member',
  pn: '+123',
  name: 'Andrew Sweet'
}
var joelProfile = {
  fbid: 1380180579,
  type:'Member',
  pn: '+789',
  name: 'Joel Simon'
}
var danielProfile = {
  fbid: 798172051,
  type:'Member',
  pn: '+456',
  name: 'Daniel Belchamber'
}
function onErr(err){if (err) throw err;};
users.getOrAddMember('andrewToken', 1, '+12', null, function(err, a) {
users.getOrAddMember('joelToken'  , 2, '+23', null, function(err, j) {
users.getOrAddMember('danielToken', 3, '+34', null, function(err, d) {
  users.addFriend(a,joelProfile.id, onErr);
  users.addFriend(a,danielProfile.id, onErr);

  users.addFriend(d,andrewProfile.id, onErr);
  users.addFriend(d,joelProfile.id, onErr);

  users.addFriend(j,andrewProfile.id, onErr);
  users.addFriend(j,danielProfile.id, onErr);

  var andrewsEventA = {
    inviteOnly : true,
    text: 'Andrews First Event'
  }

  var andrewsEventB = {
    text: 'Andrews Second Event',
    inviteOnly : true
  }

  var danielsEvent = {
    text: 'Daniels First Event',
    inviteOnly : true
  }

  events.add(andrewsEventA, a, function(err, eid) {
    if (err) console.log(err);
    events.addMessage(eid,a.uid,'Second Message', function(err) {
      events.get(eid, function(err, event) {
        console.log(err, event);
      });
    });
  });
  events.add(andrewsEventB, a, function(err, eid){
    if (err) console.log(err);
    // events.get(eid, function(err, event){
    //   console.log(err, event);
    // })
  });
  events.add(danielsEvent, d, function(err, eid){
    if (err) console.log(err);
  });



});
});
});