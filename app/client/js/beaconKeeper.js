////////////////////////////////////////////////////////////////////////////////
/*
	BeaconKeeper Class - stores all the Beacons relevant to the User (me)
*/
////////////////////////////////////////////////////////////////////////////////

function BeaconKeeper() {
	this.table = {};
	this.count = 0;
}

BeaconKeeper.prototype.renewBeacon = function(host, desc, lat, lng, attends) {
	var beacon = new Beacon(host, desc, lat, lng, attends);
	if (this.table[host]) this.removeBeacon( this.table[host] );
	this.table[host] = beacon;
	this.count++;
	drawBeacon(beacon);
	return beacon;
}

// Create a new beacon.
BeaconKeeper.prototype.newBeacon = function(host, desc, lat, lng, draw) {
	var beacon = new Beacon(host, desc, lat, lng);
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



// BeaconKeeper.prototype.insert = function(beacon, callback) {
// 	// console.trace();
// 	var self = this;
// 	if (B.beacon) B = B.beacon;
// 	if (this.table[B.host] && this.table[B.host].marker) {
// 		this.table[B.host].marker.setMap(null);
// 	}
// 	getFbData(B.host, function(img, name) {
// 		// console.log(img, name);
// 		B.marker = setBeacon(B.lat, B.lon, B.title, name+': '+B.desc);
// 		self.table[B.host] = B;
// 		// console.log(self.table);
// 		if (callback) callback();
// 	});
// }

// BeaconKeeper.prototype.draw = function() {
// 	var self = this;
// 	var seen = {};
// 	// console.log("draw", self.table);
// 	$('#beacon-list').html('');

// 	for (var key in self.table) {
// 		(function(k){
// 			var obj = self.table[k];
// 			writeBeaconEvent(obj);
// 			// else(seen[o.host] == true);
// 		})(key);
// 	}
// }

// BeaconKeeper.prototype.removeSelf = function() {
// 	// return;
// 	var self = this;
// 	// console.log('fdsjkhgljrshg', this.table);
// 	var id = me.id;
// 	$('#beacon-list').html('');
// 	// seen2 = {};
// 	for (var key in this.table) {
// 		var obj = self.table[key];
// 		// console.log(obj);
// 		var index = obj.attends.indexOf(id);
// 		if (index > -1) {
// 			obj.attends.splice(index, 1);
// 		} else if (id == obj.host) {
// 			this.remove(id);
// 		}
// 		(function(o) {
// 			writeBeaconEvent(o);
// 		})(obj);
// 	}
// }

// BeaconKeeper.prototype.create = function(lat, lng, desc) {
// 	seen2 = {};
// 	if (this.table[me.id] && this.table[me.id].marker) {
// 		this.table[me.id].marker.setMap(null);
// 	}
// 	var B = new Beacon(lat, lng,  "", desc, me.id);
// 	console.log('Creating new beacon', B)
// 	socket.emit('newBeacon', B);
// 	console.log(B);
// 	this.removeSelf();
// 	this.insert(B);
// }


