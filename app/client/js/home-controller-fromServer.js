var SERVER = window.location.origin;

var BKeeper = new BeaconKeeper();
var  socket = io.connect(SERVER);

socket.on('newBeacon', function(data) { 
	console.log('New Beacon:', data);
	BKeeper.newBeacon(data.beacon);
});

socket.on('newBeacons', function(data) {
	console.log('New Beacons:',data, socket);
	data.forEach(function(B, i) {
		BKeeper.newBeacon(B);
	});
});

socket.on('deleteBeacon', function(data) {
	console.log('detete', data);
	BKeeper.removeBeacon(data.id);
});

socket.on('addGuest', function(data) {
	console.log('addGuest', data);
	var id = data.id;
	var guest = data.guest;
	BKeeper.addGuest(id, guest);
});

socket.on('removeGuest', function(data) {
	console.log('subGuest', data);
	var id = data.id;
	var guest = data.guest;
	BKeeper.removeGuest(id, guest);
});




