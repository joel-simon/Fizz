
var pn = function(n) {
  var regexp = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/
  return regexp.test(n);
}

module.exports = {
  user: {
    uid : 'posInt',
    pn  : pn,
    name: 'string'
  },
  latlng: {
    lat: 'number',
    lng: 'number'
  },
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
    creationTime: 'posInt',
    description: 'string'
  }
}

