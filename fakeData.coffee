Joel =
  uid: 1
  pn: "+13475346100"
  name: "Domo"
  appUserDetails: { fbid : 1380180579 }
Andrew =
  uid: 2
  pn: "+13107102956"
  name: "ASweet"
  appUserDetails: { fbid : 100000157939878 }
Antonio =
  uid: 3
  pn: "+19494647070"
  name: "Anton.io"
  appUserDetails: { fbid : 1234567980 }
Russell =
  uid: 4
  pn: "+3523189733"
  name: "CoolBrow"
  appUserDetails: { fbid : 987654321 }
Bob =
  uid: 5
  pn: "+3523189733"
  name: "bob"
  appUserDetails: { fbid : 123 }
Linda =
  uid: 6
  pn: "+3523189733"
  name: "linda"
  appUserDetails: { fbid : 2345 }
Brent =
  uid: 7
  pn: "+3523189733"
  name: "brent"
  appUserDetails: { fbid : 987632354321 }

JoelsEvent =
  "eid" : 1
  "creator" : Joel.uid
  "creationTime" : 1402107555
  "location" : "Pamelas"
  "time" : 12345
AndrewsEvent = 
  "eid" : 2
  "creator" : Andrew.uid
  "creationTime" : 1402107555
  "location" : null
  "time" : 12345

module.exports = 
  ONLOGIN:
    "me": Joel
    "fbToken": "FBTOKEN"
    "newFriendList": []
    "newEventList": [ JoelsEvent, AndrewsEvent ]
    "newMessages":
      "302": [
          "mid": 1
          "eid": JoelsEvent.eid
          "uid": Joel.uid
          "marker": null
          "creationTime": 1402107555
          "text": "Joels Event! Free Sushi!"
      ]
      "303": [
          "mid": 1
          "eid": AndrewsEvent.eid
          "uid": Andrew.uid
          "marker": null
          "creationTime": 1402107555
          "text": "Andrews Event! Free sneakers!"
      ]
    "deadEventList": []
    "invitees":
      "1": [ Joel, Antonio ]
      "2": [ Andrew, Russell ]
    "guests":
      "1": [ Joel.uid ]
      "2": [ Andrew.uid ]
    "clusters":
      "1": []
      "2": [ [ Andrew.uid, Russell.uid ] ]
    "suggestedInvites":
      "1": [ {"invitees": [Andrew, Russell], "inviter":  Antonio.uid} ]