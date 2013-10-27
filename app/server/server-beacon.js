// @var host: the facebook id of the host
// @var loc: the long/lat of the event (defaults to host location)
// @var desc: decription; limit to 140 character 
// @var error: displays an error if object was not properly constructed 
// @var attends: everyone attending the event (starts with just host)
function Beacon(userId, lat, lng, desc) {
    this.host = userId;
    this.lat = lat;
    this.lng = lng;
    this.desc = desc;
    this.title = "";
    this.marker = null;

    this.attends = [];
    // send push notification
}

Beacon.prototype.add_guest = function(guestId) {
    this.attends.push(guestId); 
}

// removes guest from attends list.  1 on success, 0 on failure
Beacon.prototype.del_guest = function(guestId) {
    index = this.attends.indexOf(guestId);
    if (index > -1) {
        this.attends.splice(index, 1);
        return true;
    }
    return false;
}

Beacon.prototype.update_desc = function(desc) {
    if (desc.length > 140) {
        return false;
    } 
    this.desc = desc;
    return true; 
    // send push notification

}

// stores beacons for every user
function Beacon_keeper() {
  this.table = {};
  this.count = 0;
}

Beacon_keeper.prototype.insert = function(B) {
  this.table[B.host] = B;
}

Beacon_keeper.prototype.remove = function(userId) {
  delete this.table[userId];

}
// returns NULL on failure
Beacon_keeper.prototype.get = function(userId) {
  var B = this.table[userId];
  return B;
}

Beacon_keeper.prototype.add_guest = function(hostId, guestId) {
  var B = this.get(hostId);
  console.log(B, hostId);
  this.remove(hostId);
  if (B.attends.indexOf(guestId) == -1) {
    B.attends.push(guestId);
  }
  this.insert(B);
}
Beacon_keeper.prototype.del_guest = function(hostId, guestId) {
  var B = this.get(hostId);
  
  var index = B.attends.indexOf(guestId);
  if (index > -1) {
      B.attends.splice(index, 1);
  }
}

module.exports.Beacon = Beacon;
module.exports.Beacon_keeper = Beacon_keeper;
