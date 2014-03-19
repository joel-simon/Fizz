
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');
var store = require('../app/server/redisStore.js').store;
store.flushdb();

var andrewProfile = {
  id: 100000157939878,
  pn: '+123',
  displayName: 'Andrew Sweet'
}
var joelProfile = {
  id: 1380180579,
  pn: '+13475346100',
  displayName: 'Joel Simon'
}
// var danielProfile = {
//   id: 798172051,
//   type:'Member',
//   pn: '+456',
//   displayName: 'Daniel Belchamber'
// }
function onErr(err){if (err) throw err;};
// users.getOrAddPhone('+3107102956', function(err, a){
//   if (err) console.log(err);
//   else console.log('Created' + JSON.stringify(a));
// });
// users.getOrAddPhone('+13475346100',function(err, j){
//   if (err) console.log(err);
//   else console.log('Created' + JSON.stringify(j));
// });

users.getOrAddMember(andrewProfile, 'fakeToken', '+3107102956', null, function(err, a) {
users.getOrAddMember(joelProfile, 'fakeToken', '+13475346100', null, function(err, j) {

// users.getOrAddMember(danielProfile, 'token', '+34', null, function(err, d) {
  users.addFriend(a,j.uid, onErr);
//   users.addFriend(a,danielProfile.id, onErr);

//   users.addFriend(d,andrewProfile.id, onErr);
//   users.addFriend(d,joelProfile.id, onErr);

  users.addFriend(j,a.uid, onErr);
//   users.addFriend(j,danielProfile.id, onErr);

//   events.add('Andrews First Event', a, true, function(err, eid) {
//     if (err) console.log(err);
//     events.addMessage(eid,a.uid,'Second Message', function(err) {
//       events.get(eid, function(err, event) {
//         console.log(err, event);
//       });
//     });
//   });
//   events.add('Joels First', j, true, function(err, eid){
//     if (err) console.log(err);
//     // events.get(eid, function(err, event){
//     //   console.log(err, event);
//     // })
//   });
//   events.add('Daniels First Event', d, true, function(err, eid){
//     if (err) console.log(err);
//   });



// });
});
});