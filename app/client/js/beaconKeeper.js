////////////////////////////////////////////////////////////////////////////////
/*
	BeaconKeeper Class - stores all the Beacons relevant to the User (me)
*/
////////////////////////////////////////////////////////////////////////////////

function BeaconKeeper() {
	this.table = {};
	this.count = 0;
}

BeaconKeeper.prototype.renewBeacon = function(host, desc, lat, lng, attends, pub) {
	var beacon = new Beacon(host, desc, lat, lng, attends, pub);
	console.log(pub, beacon);
	if (this.table[host]) this.removeBeacon( this.table[host] );
	this.table[host] = beacon;
	this.count++;
	drawBeacon(beacon);
	return beacon;
}

// Create a new beacon.
BeaconKeeper.prototype.newBeacon = function(host, desc, lat, lng, draw, pub) {
	var beacon = new Beacon(host, desc, lat, lng, null, pub);
	if (this.table[host]) this.removeBeacon( this.table[host] );
	this.table[host] = beacon;
	this.count++;
	if (draw) drawBeacon(beacon);
	return beacon;
}

// Gets the host's beacon.
BeaconKeeper.prototype.getBeacon = function(host) {
	return this.table[host];
}

// Adds a guest to the host's beacon.
BeaconKeeper.prototype.addGuest = function(host, guest) {
	var beacon = this.table[host];
	beacon.addGuest(guest);
	eraseBeacon(beacon);
	drawBeacon(beacon);
}

// Removes a guest from the host's beacon.
BeaconKeeper.prototype.removeGuest = function(host, guest) {
	this.table[host].removeGuest(guest);
}

// Cancels host's beacon.
BeaconKeeper.prototype.removeBeacon = function(host) {
	eraseBeacon( this.table[host] );
	this.table[host] = null;
}

// Draw all beacons.
BeaconKeeper.prototype.drawAllBeacons = function() {
	this.table.forEach(function(beacon, host) {
		drawBeacon(beacon);
	});
}


