var latlng = {
  lat: 'number',
  lng: 'number'
}
module.exports = {
  user: {
    uid:    'posInt',
    fbid:   'posInt',
    pn:     'string',
    name:   'string',
    hasApp: function(str) {
      return (str === 'iPhone' || str === '');
    }
  },
  friendsList: {
    of: 'posInt',
    lastUpdated: 'posInt',
    list: ['user'] 
  },
  latlng: latlng,
  marker: {
    latlng: latlng,
    name: 'string',
    time: 'posInt'
  },
  message: {
    mid: 'posInt',
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt',
    marker: 'marker'
  },
  newMessage: {
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt'
  },
  newEvent : {
    creationTime: 'posInt',
    inviteList: '[user]',
    message:'newMessage'
  },
  event : {
    eid:        'posInt',
    // host:       'posInt',
    guestList:  '[posInt]',
    inviteList: '[user]',
    messageList:'[message]'
  },
  userLocation : {
    uid : 'posInt',
    latlng : 'latlng'
  },
  userLocationList : ['userLocation']
}

