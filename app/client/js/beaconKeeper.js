////////////////////////////////////////////////////////////////////////////////
/*
	BeaconKeeper Class - stores all the Beacons relevant to the User (me).
*/
////////////////////////////////////////////////////////////////////////////////

/**
 * Stores Beacons relative to the logged in User.
 * @constructor
 * @param {object} table - A table of all relevent Beacons.
 * @param {int} count - The number of Beacons contained in the table.
 */
function BeaconKeeper() {
	this.table = {};
	this.count = 0;
}

/**
 * Refreshes a given Beacon to keep all the information up to date for the User.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} desc - Currently acting as the title of the Beacon rather than an actual description.
 * @param {number} lat - The latitude of the Beacon location.
 * @param {number} lng - The longitude of the Beacon location.
 * @param {array} attends - An array of people who are attending the Beacon. 
 * @param {bool} pub - A boolean that is True when the Beacon is public and false otherwise.
 */
BeaconKeeper.prototype.renewBeacon = function(host, desc, lat, lng, attends, pub) {
	var beacon = new Beacon(host, desc, lat, lng, attends, pub);
	console.log('RENEW:', pub, beacon);
	if (this.table[host]) this.removeBeacon( this.table[host] );
	this.table[host] = beacon;
	this.count++;
	drawBeacon(beacon);
	return beacon;
}

/**
 * [Depricated - handled by renewBeacon] Creates a new beacon.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} desc - Currently acting as the title of the Beacon rather than an actual description.
 * @param {number} lat - The latitude of the Beacon location.
 * @param {number} lng - The longitude of the Beacon location.
 * @param {bool} draw - True when the Beacon should be drawn, and False otherwise.
 * @param {bool} pub - True when the Beacon is public, and False otherwise.
 */
BeaconKeeper.prototype.newBeacon = function(host, desc, lat, lng, draw, pub) {
	var beacon = new Beacon(host, desc, lat, lng, null, pub);
	if (this.table[host]) this.removeBeacon( this.table[host] );
	this.table[host] = beacon;
	this.count++;
	if (draw) drawBeacon(beacon);
	return beacon;
}

/** 
 * Returns the host's Beacon object.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 */
BeaconKeeper.prototype.getBeacon = function(host) {
	return this.table[host];
}

/** 
 * Adds a guest to the host's beacon.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} guest - The guest ID of the person joining the Beacon.
 */
BeaconKeeper.prototype.addGuest = function(host, guest) {
	var beacon = this.table[host];
	beacon.addGuest(guest);
	eraseBeacon(beacon);
	drawBeacon(beacon);
}

/** 
 * Removes a guest from the host's Beacon.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} guest - The guest ID of the person leaving the Beacon.
 */
BeaconKeeper.prototype.removeGuest = function(host, guest) {
	this.table[host].removeGuest(guest);
}

/** 
 * Removes the host's Beacon.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 */
BeaconKeeper.prototype.removeBeacon = function(host) {
	eraseBeacon( this.table[host] );
	this.table[host] = null;
}

/** 
 * Draws all Beacons in BeaconKeeper's table.
 */
BeaconKeeper.prototype.drawAllBeacons = function() {
	this.table.forEach(function(beacon, host) {
		drawBeacon(beacon);
	});
}


