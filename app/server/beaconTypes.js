
module.exports = {
  user: {
    uid:    'posInt',
    fbid:   'posInt',
    pn:     'string',
    name:   'string',
    hasApp: 'string'
  },
  friendsList: {
    of: 'posInt',
    lastUpdated: 'posInt',
    list: ['user'] 
  },
  latlng: {
    lat: 'number',
    lng: 'number'
  },
  marker: {
    latlng: this.latlng,
    name: 'string',
    time: 'posInt'
  },
  message: {
    mid: 'posInt',
    eid: 'posInt',
    uid: 'user',
    text: 'string',
    creationTime: 'posInt',
    marker: 'marker'
  },
  newMessage: {
    eid: 'posInt',
    uid: 'posInt',
    text: 'string',
    creationTime: 'posInt',
    // marker: 'marker'
  },
  newEvent : {
    creationTime: 'posInt',
    inviteList: 'array',
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

