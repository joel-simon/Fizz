var SERVER = window.location.origin;
var socket = io.connect(SERVER);
var BKeeper = new BeaconKeeper();

socket.emit('login', {admin: true});

socket.on('newBeacon', function(data) {
	var beacon = data.beacon;
	console.log(beacon, BKeeper.table[beacon.host]);
	if (BKeeper.table[beacon.host]) BKeeper.removeBeacon(beacon.host);
	BKeeper.renewBeacon(beacon.host, beacon.desc, beacon.lat, beacon.lng, beacon.attends);
});

socket.on('newBeacons', function(data) {
	// console.log('new beacons:',data);
	data.forEach(function(B, i) {
		BKeeper.renewBeacon(B.host, B.desc, B.lat, B.lng, B.attends);
	});
});

socket.on('deleteBeacon', function(data) {
	BKeeper.removeBeacon(data.host);
});