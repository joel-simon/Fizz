
var users = require('../app/server/users.js');
var events = require('../app/server/Events.js');

var andrewProfile = {
  id: 100000157939878,
  displayName: 'Andrew Sweet'
}
var joelProfile = {
  id: 1380180579,
  displayName: 'Joel Simon'
}
var danielProfile = {
  id: 798172051,
  displayName: 'Daniel Belchamber'
}
function onErr(err){if (err) throw err;};
users.getOrAdd(andrewProfile, 'fake', function(err, a){
  // console.log('created andrew',a);
users.getOrAdd(joelProfile, 'fake', function(err, j){
  // console.log('created joel', j);
users.getOrAdd(danielProfile, 'fake', function(err, d){
  // console.log('created daniel',d);

  users.addFriend(a,joelProfile.id, onErr);
  users.addFriend(a,danielProfile.id, onErr);

  users.addFriend(d,andrewProfile.id, onErr);
  users.addFriend(d,joelProfile.id, onErr);

  users.addFriend(j,andrewProfile.id, onErr);
  users.addFriend(j,danielProfile.id, onErr);

  var andrewsEventA = {
    eid: null,
    host : a.uid,
    guestList : [a.uid , j.uid, d.uid],
    inviteList : [a, j, d],
    message:{
      mid: null,
      uid: a.uid,
      text: 'Andrews First Event',
      creationTime: Date.now(),
      marker: {
        name:'Yuka sushi',
        time: Date.now()+(1000*60*30),
        latlng: {lat:40.774614,lng:-73.954459}
      }
    }
  }

  var andrewsEventB = {
    eid: null,
    host : a.uid,
    guestList : [a.uid],
    inviteList : [a, j, d],
    message:{
      mid: null,
      uid: a.uid,
      text: 'Andrews Second Event',
      creationTime: Date.now()+1,
      marker: {
        name:'Angelo\'s Pizzeria',
        time: Date.now()+(1000*60*30),
        latlng: {lat:40.757964,lng:-73.966608}
      }
    }
  }

  var danielsEvent = {
    eid: null,
    host : d.uid,
    guestList : [d.uid],
    inviteList : [d, j, a],
    message:{
      mid: null,
      uid: d.uid,
      text: 'Daniels First Event',
      creationTime: Date.now()+2,
      marker: {
        name:'Blue Bottle Coffee',
        time: Date.now()+(1000*60*30),
        latlng: {lat:40.758590,lng:-73.982674}
      }
    }
  }

  events.add(andrewsEventA, function(err, eid) {
    events.addMessage({
      mid: null,
      eid: eid,
      uid: a.uid,
      text: 'Second Message',
      creationTime: Date.now()+5,
      marker: {
        name:'Central Park',
        time: Date.now()+(1000*60*30),
        latlng: {lat:40.782865,lng:-73.965355}
      }
    }, onErr);
  });
  events.add(andrewsEventB, function(err, eid){
  });
  events.add(danielsEvent, function(err, eid){
  });




});
});
});