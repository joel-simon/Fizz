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
    if ((typeof u.uid !== 'number')|| u.uid === 0) throw('foo');
    if ((typeof u.fbid !== 'number')) throw('foo');
    // if ((typeof u.pn !== 'string')) throw('foo');
    if ((typeof u.type !== 'string')) throw('foo');
    if ((typeof u.name !== 'string')) throw('foo');
    if ((typeof u.fbToken !== 'string')) throw('foo');
    // if ((typeof u.iosToken !== 'string')) throw('foo');

    switch(u.type) {
      case "Member":
        if (u.fbid === 0) throw('foo');
        // if (u.pn.length === 0) throw('foo');
        if (u.fbToken.length === 0) throw('foo');
        // if (u.iosToken.length === 0) throw('foo');
        break;
      case "Guest":
        if (u.fbid === 0) throw('foo');
        // if (u.pn.length === 0) throw('foo');
        if (u.fbToken.length === 0) throw('foo');
        break;
      case "Phone":
        // if (u.pn.length === 0) throw('foo')
        break;
      default:
        return false;
    }
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
    creator:    'posInt',
    guestList:  '[posInt]',
    inviteList: '[user]',
    seats:      'posInt',
    messageList:'[message]'
  },
  newEvent: {
    inviteOnly: 'bool',
    // inviteList: '[user]',
    // invitePnList: '[string]',
    text:'string'
  },
  // userLocation : {
  //   uid : 'posInt',
  //   latlng : 'latlng'
  // },
  // userLocationList : ['userLocation']
}

