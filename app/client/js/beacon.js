// @var host: the facebook id of the host
// @var attending: everyone attending the event (starts with just host)
// @var pos: the latitude/longitude of the event (defaults to host location)
// @var title: name of the beacon event; limit to 30 characters
// @var description: decribes the nature of the event; limit to 140 characters 
// @var error: displays an error if object was not properly constructed 
// @var marker: the googleMaps marker associated with the beacon
function Beacon(latitude, longitude, title, description, userId) {
	// (description.length > 140) ? this.error = "length_error" : this.error = "";

	if (userId) {
		this.host = userId;
		this.attends = [userId];
	} else {
		this.host = 'test';
		this.attends = [];
	}

	this.lat = latitude;
	this.lon = longitude;
	this.title = '';
	this.desc = userId+': '+description;
}

Beacon.prototype.add_guest = function(guestId) {
	this.attending.push(guestId); 
}

// removes guest from attending list.  1 on success, 0 on failure
Beacon.prototype.delete_guest = function(guestId) {
	index = this.attending.indexOf(guestId);
	if (index > -1) {
		this.attending.splice(index, 1);
		return true;
	}
	return false;
}

Beacon.prototype.update_description = function(description) {
	console.trace();
	if (description.length > 140) {
		return false;
	} 
	this.description = description;
	return true; 
	// send push notification
}

// stores beacons for every user
function Beacon_keeper() {
  this.table = {};
  this.count = 0;
}

Beacon_keeper.prototype.insert = function(B) {
	if (B.beacon) B = B.beacon;
	if (this.table[B.host] && this.table[B.host].marker) {
		this.table[B.host].marker.setMap(null);
	}
	B.marker = setBeacon(B.lat, B.lon, B.title, B.desc);
	this.table[B.host] = B;

	$('#beacon-list').html('');
	for (var key in this.table) {
  	var obj = this.table[key];
  	console.log(obj);
  	(function(o){
  		writeBeaconEvent(o);
  	})(obj);
	}
}

Beacon_keeper.prototype.create = function(lat, long, desc) {
	if (this.table[me.id] && this.table[me.id].marker) {
		this.table[me.id].marker.setMap(null);
	}
  var B = new Beacon(lat, long,  "", desc, me.id);
  console.log('Creating new beacon', B)
  socket.emit('newBeacon', B);
  console.log(B);
  this.insert(B);
}
Beacon_keeper.prototype.add_guest = function(host, guestId){
	this.table[host].add_guest(guestId);
}

Beacon_keeper.prototype.remove = function(userId) {
  this.table[userId] = 'undefined';

}
// returns NULL on failure
Beacon_keeper.prototype.get = function(userId) {
  var B = this.table[userId];
  return B;
}

Beacon_keeper.prototype.getAll = function() {
	return this.table;
}