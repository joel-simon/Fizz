var SERVER = window.location.origin;

var BKeeper = new BeaconKeeper();
var  socket = io.connect(SERVER);

socket.on('newBeacon', function(data) { BKeeper.newBeacon(data.beacon) });
// 	var b = data.beacon;
// 	if (validate(b) && !BKeeper.table[b.id]) {
// 		BKeeper.new(b);
// 	}
// 	// console.log('RECEIVING: ', beacon, BKeeper.table[beacon.host]);
// 	// if (BKeeper.table[beacon.host]) BKeeper.removeBeacon(beacon.host);
// });

socket.on('newBeacons', function(data) {
	console.log('new beacons:',data, socket);
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

socket.on('subGuest', function(data) {
	console.log('subGuest', data);
	var id = data.id;
	var guest = data.guest;
	BKeeper.removeGuest(id, guest);
});

socket.on('guest', function(data) {
});


