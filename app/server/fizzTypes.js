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
    if (!u) throw (u +' user');
    if (u.isServer) return true;   

    if ((typeof u.uid !== 'number') || u.uid === 0) throw('Bad uid:'+uid);
    if ((typeof u.pn !== 'string')) throw('Bad Pn:'+pn);
    if ((typeof u.name !== 'string')) throw('Bad name:'+name);
    return true;
  },
  friendsList: {
    of: 'posInt',
    lastUpdated: 'posInt',
    list: ['user'] 
  },
  latlng: latlng,
  message: {
    mid: 'posInt',
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt',
  },
  newMessage: {
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt'
  },
  event: {
    eid:        'posInt',
    guestList:  '[posInt]',
    inviteList: '[user]',
    seats:      'posInt',
  },
  newEvent: {
    inviteOnly: 'bool',
    text:'string'
  },
  // userLocation : {
  //   uid : 'posInt',
  //   latlng : 'latlng'
  // },
  // userLocationList : ['userLocation']
}

