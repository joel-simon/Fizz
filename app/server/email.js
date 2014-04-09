var mail = require("nodemailer").mail;
var s = 'Error: NO USER FOUND{"eventList":[{"eid":1,"inviteOnly":false,"creator":1,"seats":2,"messageList":[{"text":"Test!","mid":1,"eid":1,"uid":1,"creationTime":1396830435661}],"inviteList":[{"uid":1,"name":"Joel Simon","pn":"+13475346100","type":"Member","fbid":1380180579}],"guestList":[1]}],"friendList":[]}';
mail({
  from: "<foo@blurdybloop.com>", // sender address
  to: "joelsimon6@gmail.com", // list of receivers
  subject: "You fucked up.", // Subject line
  text: s, // plaintext body
  html: "<b>"+s+"</b>" // html body
});