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
			// console.log('you are a guest!');
			return true;
		}
	}
	// console.log('you are not a guest!');
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
 * [Depricated] Updates the description of this Beacon.
 * @param {string} description - Information relating to this Beacon.
 */
// Beacon.prototype.updateDescription = function(description) {
// 	this.desc = description;
// 	setMarkerInfo(this.marker, this.title, description);
// }
