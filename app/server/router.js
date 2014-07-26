// var onSms = require('./smsHandler.js');
var models = require('./models')
module.exports = function(app, passport) {
	
	app.get('/c/*',
		passport.authenticate('sms', { failureRedirect: '/' }),
		function(req, res) {
			res.render('home', {});
	});

	app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
	);


	app.post('/registration', function(req, res) {
		console.log('registration: req.body = ', req.body);
		var first = req.body.firstName;
		var last = req.body.lastName;
		var platform = req.body.platform;
		var token = req.body.phoneToken;
		var pn = req.body.pn;
		if (!first || !last || !platform || !token || !pn) {
			console.log('invalid body paramaters');
			return res.send(400, 'invalid body paramaters');
		}
		var name = first + " " +last;
		models.users.create(pn, name, platform, token, function(err, password) {
			if (err) {
				console.log('err in create users');
				res.send(400, err);
			} else {
				console.log('registration successful, password:', password);
				res.send(200);
			}
		});
	});

	app.get('/', ensureAuthenticated, function(req, res) {
		res.redirect('/home');
	});
	
	app.get('/index', function(req, res) {
		res.render('index', {});
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
function ensureAuthenticated(req, res, next) {
	// console.log(req.cookies);
	if (req.isAuthenticated()) return next();
	res.redirect('/index');
}



	// app.get('/auth/facebook',
	// passport.authenticate('facebook', { display: 'page', scope: ['user_friends', 'user_groups', 'email'] }),
	// function(req, res){
	// 	// res.redirect('/home');
	// });
	// app.get('/auth/facebook/callback',  passport.authenticate('facebook', { failureRedirect: '/' }),
	// 	function(req, res) {
	// 		res.redirect('/home');
	// });
