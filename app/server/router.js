// var onSms = require('./smsHandler.js');
var models = require('./models')
var utils  = require('./utilities')
var output = require('./output')

module.exports = function(app, passport) {
	
	app.get('/c/*',
		passport.authenticate('sms', { failureRedirect: '/' }),
		function(req, res) {
			res.render('home', {});
	});



	app.post('/login',
  	passport.authenticate('local'), function(req, res) {
  		res.send(200);
  	}
	);


	app.post('/registration', function(req, res) {
		utils.log('On registration data', req.body);
		var first = req.body.firstName;
		var last = req.body.lastName;
		var platform = req.body.platform;
		var token = req.body.phoneToken || 'noToken';
		var pn = req.body.pn;
		if (!first || !last || !platform || !token || !pn) {
			console.log('invalid body paramaters');
			return res.send(400, 'invalid body paramaters');
		}
		var name = first + " " +last;
		models.users.create(pn, name, platform, token, function(err, user) {
			if (err) {
				console.log('err in create users');
				res.send(400, err);
			} else {
				utils.log('registration successful', 'password:'+user.password);
				output.sendSms('Your Fizz code:'+user.password, pn, function(){})
				res.send(200);
			}
		});
	});

	app.get('/e/:eid',function(req, res) {
		eid = parseInt(req.params.eid)
		console.log(eid);
		if (isNaN(eid)) return res.end()
		models.events.getFull(eid, function(err, event, messages, inviteList, guests){
			if (err || ! event) return res.send(404)
			guestList= inviteList.filter(function (user) { return guests.indexOf(user.uid) >= 0 })
			noReply  = inviteList.filter(function (user) { return guests.indexOf(user.uid) == -1 })
			// console.log(guestList);
			// console.log(noReply);
			creator = inviteList.filter(function (user) { return user.uid == event.creator })[0]
			console.log(event.creator, inviteList);
			res.render('index.jade', {event: event, creator:creator, messages: messages, noReply:noReply, guestList:guestList });
		});
	});

	app.get('/', function(req, res) {
		res.send('Fizz');
	});
	
	// var handler = require('./smsHandler.js');	
	// app.post('/onMessage', function(req, res) {
	// 	var body = req.body.Body;
	// 	var from = req.body.From;
	// 	var to = req.body.To;
	// 	handler.onSms(from, to, body);
	// 	res.end('');
	// });

	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
// function ensureAuthenticated(req, res, next) {
// 	// console.log(req.cookies);
// 	if (req.isAuthenticated()) return next();
// 	res.redirect('/index');
// }