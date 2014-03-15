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
    if (!u) return false
    if ((typeof u.uid !== 'number')|| u.uid === 0) return false;
    if ((typeof u.fbid !== 'number')) return false;
    if ((typeof u.pn !== 'string')) return false;
    if ((typeof u.type !== 'string')) return false;
    if ((typeof u.name !== 'string')) return false;
    if ((typeof u.fbToken !== 'string')) return false;
    if ((typeof u.iosToken !== 'string')) return false;

    switch(u.type) {
      case "Member":
        if (u.fbid === 0) return false;
        if (u.pn.length === 0) return false;
        if (u.fbToken.length === 0) return false;
        if (u.iosToken.length === 0) return false;
        break;
      case "Guest":
        if (u.fbid === 0) return false;
        if (u.pn.length === 0) return false;
        if (u.fbToken.length === 0) return false;
        break;
      case "Phone":
        if (u.pn.length === 0) return false
        break;
      default:
        return false;
    }
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
    creator:    'posInt',
    guestList:  '[posInt]',
    inviteList: '[user]',
    seats:      'posInt',
    messageList:'[message]'
  },
  newEvent: {
    inviteOnly: 'bool',
    inviteList: '[user]',
    invitePnList: '[string]',
    message:'newMessage'
  },
  // userLocation : {
  //   uid : 'posInt',
  //   latlng : 'latlng'
  // },
  // userLocationList : ['userLocation']
}

