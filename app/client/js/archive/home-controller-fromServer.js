var SERVER = window.location.origin;
var socket = io.connect(SERVER);

var BKeeper = new BeaconKeeper();

////////////////////////////////////////////////////////////////////////////////

socket.on('myInfo', function(data) {
	console.log('MY INFO:', data);
	var me = data.me;
});

socket.on('friendList', function(data) {
	console.log('FRIEND LIST:', data);
	var friendList = data.friendList;
});

socket.on('eventList', function(data) {
	console.log('EVENT LIST:', data);
	var eventList = data.eventList;
});

socket.on('newEvent', function(data) {
	console.log('NEW EVENT:', data);
	var event = data.event;
});

socket.on('updateEvent', function(data) {
	console.log('UPDATING EVENT:', data);
	var startTime = data.startTime;
	var marker = data.marker;
});

socket.on('deleteEvent', function(data) {
	console.log('DELETING EVENT:', data);
	var eid = data.eid;
});

socket.on('addGuest', function(data) {
	console.log('ADDING GUEST:', data);
	var guest = data.guest;
});

socket.on('removeGuest', function(data) {
	console.log('REMOVING GUEST:', data);
	var guest = data.guest;
});

socket.on('newComment', function(data) {
	console.log('NEW COMMENT:', data);
	var comment = data.comment;
});

socket.on('newUserLocationList', function(data) {
	console.log('USER LOCATIONS:', data);
	var userLocationList = data.userLocationList;
});

////////////////////////////////////////////////////////////////////////////////

socket.on('friendsList', function(data) {
	console.log('FRIENDS LIST:', data);
	friends = data.data;
	loadGroup();
});

socket.on('group', function(data) {
	console.log('GROUP:', data);
	group = data.data;
});

socket.on('userData', function(data) {
	console.log('USER DATA:', data);
	friends = data.friends;
	group = data.group;
	loadGroup();
});

socket.on('newBeacons', function(data) {
	console.log('BEACON UPLOAD:', data);
	data.forEach(function(B, i) {
		console.log('BEACON '+i+':', B);
		BKeeper.newBeacon(B);
	});
});

socket.on('newBeacon', function(data) { 
	console.log('NEW BEACON:', data);
	BKeeper.newBeacon(data.beacon);
});

socket.on('deleteBeacon', function(data) {
	console.log('DELETING BEACON:', data);
	var id = data.id;
	BKeeper.removeBeacon(id);
});

socket.on('addGuest', function(data) {
	console.log('ADDING GUEST', data);
	var id = data.id;
	var guest = data.guest;
	BKeeper.addGuest(id, guest);
});

socket.on('removeGuest', function(data) {
	console.log('REMOVING GUEST', data);
	var id = data.id;
	var guest = data.guest;
	BKeeper.removeGuest(id, guest);
});

socket.on('newComment', function(data) {
	console.log('NEW COMMENT', data);
	var bid = data.id;
	var user = data.comment.user;
	var comment = data.comment.comment;
	var cid = data.comment.id;
	BKeeper.addComment(bid, user, comment, cid);
});

socket.on('updateBeacon', function(data) {
	console.log('UPDATING BEACON', data);
	var id = data.id;
	var loc = data.location;
	var title = data.title;
	if (title) BKeeper.updateTitle(id, title);
	if (loc)   BKeeper.updateLocation(id, loc.lat, loc.lng);
});




