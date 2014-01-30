////////////////////////////////////////////////////////////////////////////////
/*
	Server Listener - listens for any socket communication from the server and 
		responds appropriately
*/
////////////////////////////////////////////////////////////////////////////////

var SERVER = window.location.origin;
var socket = io.connect(SERVER);

socket.on('myInfo', function(me) {
	console.log('MY INFO:', me);
	MIM = new MyInfoManager(me);
});

socket.on('friendList', function(data) {
	console.log('FRIEND LIST:', data);
	var friendList = data.friendList;
	MIM.updateFriendList(friendList);
});

socket.on('eventList', function(data) {
	console.log('EVENT UPLOAD:', data);
	var eventList = data.eventList;
	eventList.forEach(function(event, i) {
		console.log('EVENT '+i+':', event);
		ELM.newEvent(event);
	});
});

socket.on('newEvent', function(data) {
	console.log('NEW EVENT:', data);
	var event = data.event;
	ELM.newEvent(event);
});

socket.on('deleteEvent', function(data) {
	console.log('DELETING EVENT:', data);
	var eid = data.eid;
	ELM.deleteEvent();
});

socket.on('addGuest', function(data) {
	console.log('ADDING GUEST:', data);
	var eid = data.eid;
	var uid = data.uid;
	var event = ELM.getEvent(eid);
	event.addGuest(uid);
});

socket.on('removeGuest', function(data) {
	console.log('REMOVING GUEST:', data);
	var eid = data.eid;
	var uid = data.uid;
	var event = ELM.getEvent(eid);
	event.removeGuest(uid);
});

socket.on('newMessage', function(data) {
	console.log('NEW COMMENT:', data);
	var message = data.message;
	var eid = message.eid;
	var event = ELM.getEvent(eid);
	event.addMessage(message);
});

socket.on('newUserLocationList', function(data) {
	console.log('USER LOCATIONS:', data);
	var userLocationList = data.userLocationList;
});