////////////////////////////////////////////////////////////////////////////////
/*
	Beacon Class - contains all the information of each Beacon.
*/
////////////////////////////////////////////////////////////////////////////////

/**
 * Represents a Beacon Event.
 * @constructor
 * @param {string} host - The host ID of the person or company hosting the Beacon.
 * @param {string} description - Currently acting as the title of the Beacon rather than an actual description.
 * @param {number} latitude - The latitude of the Beacon location.
 * @param {number} longitude - The longitude of the Beacon location.
 * @param {array} attends - An array of people who are attending the Beacon. 
 * @param {bool} pub - A boolean that is True when the Beacon is public and false otherwise.
 */
function Beacon(host, description, latitude, longitude, attends, pub) {
	this.host = host;
	this.attends = attends || [];
	this.title = ''; // potential feature of the beacon to be added later
	this.desc = description;
	this.lat = latitude;
	this.lng = longitude;
	this.marker = createMarker(latitude, longitude);
	this.pub = pub || false;
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
 * Updates the description of this Beacon.
 * @param {string} description - Information relating to this Beacon.
 */
Beacon.prototype.updateDescription = function(description) {
	this.desc = description;
	setMarkerInfo(this.marker, this.title, description);
}
