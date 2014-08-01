var latlng = {
  lat: 'number',
  lng: 'number'
}
var pn = function(n) {
  var regexp = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/
  return regexp.test(n);
}


module.exports = {
  user: function(u) {
    if (!u) throw (' No user object passed');
    if ((typeof u.uid !== 'number') || u.uid === 0) throw('Bad uid:'+uid)
    if ((typeof u.pn !== 'string')) throw('Bad Pn:'+pn);
    if ((typeof u.name !== 'string')) throw('Bad name:'+name);
    return true;
  },
  latlng: latlng,
  message: {
    mid: 'posInt',
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt',
  },
  event: {
    eid:        'posInt',
    creator:    'posInt',
    seats:      'posInt',
    creationTime: 'posInt',
    description: 'string'
  }
}

