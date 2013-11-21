////////////////////////////////////////////////////////////////////////////////
/*
	Beacon Class - contains all the information of each beacon
*/
////////////////////////////////////////////////////////////////////////////////

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

// Adds a guest to the attends list of this beacon.
Beacon.prototype.addGuest = function(guest) {
	this.attends.push(guest);
}

Beacon.prototype.hasGuest = function(guest) {
	// console.log('checking if you are a guest...', this.attends, typeof guest, me.id);
	for (var i = 0; i < this.attends.length; i++) {
		if (this.attends[i] == guest) {
			// console.log('you are a guest!');
			return true;
		}
	}
	// console.log('you are not a guest!');
	return false;
}

// Removes a guest from the attends list of this beacon.
Beacon.prototype.removeGuest = function(guest) {
	index = this.attends.indexOf(guest);
	if (index > -1) {
		this.attends.splice(index, 1);
	}
}

// Updates the description of this beacon.
Beacon.prototype.updateDescription = function(description) {
	this.desc = description;
	setMarkerInfo(this.marker, this.title, description);
}
