////////////////////////////////////////////////////////////////////////////////
/*
	Server Listener - listens for any socket communication from the server and
		responds appropriately
*/
////////////////////////////////////////////////////////////////////////////////

var SERVER = window.location.origin;
var socket = io.connect(SERVER);

socket.on('onLogin', function(data) {
	console.log('LOGIN:', data);
	var userData = data.me;
	var friendList = data.friendList;
	MIM = new MyInfoManager(userData, friendList);
	var eventList = data.eventList;
	eventList.forEach(function(event, i) {
		console.log('EVENT '+i+':', event);
		ELM.addEvent(event);
	});
	createEvents();
});

socket.on('newFriend', function(data) {
	console.log('NEW FRIEND:', data);
	var userData = data.userData
	MIM.friendList.addUser(userData);
});

socket.on('newEvent', function(data) {
	console.log('NEW EVENT:', data);
	var event = data.event;
	ELM.addEvent(event);
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

socket.on('newInviteList', function(data) {
	var eid = data.eid;
	var inviteList = data.inviteList;
	var event = ELM.getEvent(eid);
	inviteList.forEach(function(userData, i) {
		event.addInvite(userData);
	});
});

socket.on('newMessage', function(data) {
	console.log('NEW MESSAGE:', data);
	var message = data.message;
	var eid = message.eid;
	var event = ELM.getEvent(eid);
	event.addMessage(message);
});

socket.on('setSeatCapacity', function(data) {
	var eid = data.eid;
	var seats = data.seats;
	var event = ELM.getEvent(eid);
	event.setSeats(seats);
});