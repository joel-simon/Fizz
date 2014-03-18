
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');
var store = require('../app/server/redisStore.js').store;
store.flushdb();

var andrewProfile = {
  id: 100000157939878,
  type:'Member',
  pn: '+123',
  displayName: 'Andrew Sweet'
}
var joelProfile = {
  id: 1380180579,
  type:'Member',
  pn: '+789',
  displayName: 'Joel Simon'
}
var danielProfile = {
  id: 798172051,
  type:'Member',
  pn: '+456',
  displayName: 'Daniel Belchamber'
}
function onErr(err){if (err) throw err;};
users.getOrAddMember(andrewProfile, 'token', '+12', null, function(err, a) {
users.getOrAddMember(joelProfile  , 'token', '+23', null, function(err, j) {
users.getOrAddMember(danielProfile, 'token', '+34', null, function(err, d) {
  users.addFriend(a,joelProfile.id, onErr);
  users.addFriend(a,danielProfile.id, onErr);

  users.addFriend(d,andrewProfile.id, onErr);
  users.addFriend(d,joelProfile.id, onErr);

  users.addFriend(j,andrewProfile.id, onErr);
  users.addFriend(j,danielProfile.id, onErr);

  events.add('Andrews First Event', a, true, function(err, eid) {
    if (err) console.log(err);
    events.addMessage(eid,a.uid,'Second Message', function(err) {
      events.get(eid, function(err, event) {
        console.log(err, event);
      });
    });
  });
  events.add('Joels First', j, true, function(err, eid){
    if (err) console.log(err);
    // events.get(eid, function(err, event){
    //   console.log(err, event);
    // })
  });
  events.add('Daniels First Event', d, true, function(err, eid){
    if (err) console.log(err);
  });



});
});
});