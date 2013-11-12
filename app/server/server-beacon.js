// @var host: the facebook id of the host
// @var loc: the long/lat of the event (defaults to host location)
// @var desc: decription; limit to 140 character 
// @var error: displays an error if object was not properly constructed 
// @var attends: everyone attending the event (starts with just host)
function Beacon(userId, lat, lng, desc, pub) {
  this.host = userId;
  this.lat = lat;
  this.lng = lng;
  this.desc = desc;
  this.title = "myTitle";
  this.marker = null;
  this.pub = pub || false;
  this.attends = [];
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
}

module.exports = Beacon;