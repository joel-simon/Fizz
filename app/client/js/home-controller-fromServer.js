var SERVER = window.location.origin;

var BKeeper = new BeaconKeeper();
var socket = io.connect(SERVER);

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

socket.on('updateBeacon', function(data)  {
	console.log('UPDATING BEACON', data);
	var id = data.id;
	var loc = data.location;
	var title = data.title;
	if (title) BKeeper.updateTitle(id, title);
	if (loc)   BKeeper.updateLocation(id, loc.lat, loc.lng);
});




