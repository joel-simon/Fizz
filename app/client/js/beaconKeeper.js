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
 * Creates a new beacon.
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} title - The title of the Beacon event.
 * @param {number} lat - The latitude of the Beacon location.
 * @param {number} lng - The longitude of the Beacon location.
 * @param {bool} draw - True when the Beacon should be drawn, and False otherwise.
 * @param {bool} pub - True when the Beacon is public, and False otherwise.
 */
BeaconKeeper.prototype.newBeacon = function(b) {
	if (validate(b)) {
		if (this.table[b.id]) this.removeBeacon(b.id);
		var B = new Beacon(b);
		this.table[b.id] = B;
		this.count++;
		drawBeacon(B);
	} else {
		console.log('Invalid Beacon', b);
	}
}

/** 
 * Returns the id's Beacon object.
 * @param {int} id - The unique Beacon ID.
 */
BeaconKeeper.prototype.getBeacon = function(id) {
	return this.table[id];
}

/** 
 * Adds a guest to the host's beacon.
 * @param {int} id - The unique Beacon ID.
 * @param {string} guest - The guest ID of the person joining the Beacon.
 */
BeaconKeeper.prototype.addGuest = function(id, guest) {
	var beacon = this.table[id];
	beacon.addGuest(guest);
	drawAddedGuest(id, guest);
}

/** 
 * Removes a guest from the host's Beacon.
 * @param {int} id - The unique Beacon ID.
 * @param {string} guest - The guest ID of the person leaving the Beacon.
 */
BeaconKeeper.prototype.removeGuest = function(id, guest) {
	var beacon = this.table[id];
	var index  = beacon.attends.indexOf(guest);
	if (index > -1) {
		beacon.attends.splice(index, 1);
	}
	eraseRemovedGuest(id, guest);
}


/** 
 * Adds a comment to the Beacon.
 */
BeaconKeeper.prototype.addComment = function(id, user, comment, comId) {
	var beacon = this.table[id];
	beacon.addComment(user, comment, comId);
	var cid = comId || (beacon.comments.length - 1);
	drawAddedComment(id, cid, user, comment);
}


/** 
 * Updates the title of the Beacon.
 */
BeaconKeeper.prototype.updateTitle = function(id, title) {
	var beacon = this.table[id];
	beacon.updateTitle(title);
	// eraseBeacon(beacon);
	// drawBeacon(beacon);
}

/** 
 * Updates the location of the Beacon.
 */
BeaconKeeper.prototype.updateLocation = function(id, lat, lng) {
	var beacon = this.table[id];
	beacon.updateLocation(lat, lng);
}


/** 
 * Removes the host's Beacon.
 * @param {int} id - The unique Beacon ID.
 */
BeaconKeeper.prototype.removeBeacon = function(id) {
	eraseBeacon( this.table[id] );
	delete this.table[id];
	this.count--;
}

/**
 * Removes all public Beacons.
 */
// BeaconKeeper.prototype.removePublicBeacons = function() {
// 	for (var id in this.table) {
// 		this.removeBeacon(id);
// 		socket.emit('deleteBeacon', {'id':id});
// 	}
// }

/**
 * Removes all Beacons.
 */
// BeaconKeeper.prototype.removeAllBeacons = function() {
// 	for (var id in this.table) {
// 		this.removeBeacon(id);
// 		socket.emit('deleteBeacon', {'id':id});
// 	}
// }


/** Verify  a beacon.
 * 
 * @param {Object} b - the beacon to insert
 * @return {Bool} - if it is a valid beacon
 */
function validate (b) {
  if (!b.id   || typeof b.id   !== 'number' || b.id%1 !== 0) return false;
  if (!b.host || typeof b.host !== 'string') return false;
  if (!b.lat  || typeof b.lat  !== 'number') return false;
  if (!b.lng  || typeof b.lng  !== 'number') return false;
  if (typeof b.title !== 'string')  return false;
  // if (!b.pub  || typeof b.pub  !== 'boolean')  return false;
  if (!(b.attends && b.attends instanceof Array)) return false;
  if (!(b.comments && b.comments instanceof Array)) return false;
  return true;
}
