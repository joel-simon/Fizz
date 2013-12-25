////////////////////////////////////////////////////////////////////////////////
/*
	Beacon Class - contains all the information of each Beacon.
*/
////////////////////////////////////////////////////////////////////////////////

/**
 * Represents a Beacon Event.
 * @constructor
 * @param {object} b - The Beacon given by the server. Contains: id, lat, lng,
 *     host, attends, title, comments
 */
function Beacon(b) {
	var self = this;
	for (var key in b) {
		if(b.hasOwnProperty(key)) {
			self[key] = b[key];
		}
	}
	self.marker = createMarker(b.lat, b.lng);
}

/** 
 * Adds a guest to the attends list of this beacon.
 * @param {string} guest - The guest ID of the person joining this Beacon.
 */
Beacon.prototype.addGuest = function(guest) {
	this.attends.push(guest);
}

/**
 * Checks the Beacon's attends parameter for a specific guest, and returns true
 * if that guest is attending.
 * @param {string} guest - The guest ID of the person potentially attending this Beacon.
 */
Beacon.prototype.hasGuest = function(guest) {
	for (var i = 0; i < this.attends.length; i++) {
		if (this.attends[i] == guest) {
			return true;
		}
	}
	return false;
}

/** 
 * Removes a guest from the attends array of this Beacon, or leaves the attends
 * array unchanged otherwise.
 * @param {string} guest - The guest ID of the person leaving this Beacon.
 */
Beacon.prototype.removeGuest = function(guest) {
	index = this.attends.indexOf(guest);
	if (index > -1) {
		this.attends.splice(index, 1);
	}
}

/**
 * Adds a comment to the message chain.
 */
Beacon.prototype.addComment = function(user, comment) {
	this.comments.push({'user' : user, 'comment' : comment});
}

/** 
 * Updates the title of this Beacon.
 * @param {string} title - Information relating to this Beacon.
 */
Beacon.prototype.updateTitle = function(title) {
	this.title = title;
	setMarkerInfo(this.marker, title);
}

/** 
 * Updates the location of this Beacon.
 * @param {float} lat - lattitude
 * @param {float} lng - lng
 */
Beacon.prototype.updateLocation = function(lat, lng) {
	removeMarker(this.marker);
	this.marker = createMarker(lat, lng);
}
