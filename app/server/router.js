
module.exports = function(app, passport) {
	

	app.get('/c/*',
		passport.authenticate('sms', { failureRedirect: '/' }),
		function(req, res) {
			res.render('home', {});
	});

	// app.get('/foo/*', function(req, res) {
	// 	console.log(req.params);
	// 	res.render('index', {});
	// });

	app.post('/iosLogin',
		passport.authenticate('facebook-token', { display: 'page', scope: ['user_friends', 'user_groups', 'email'] }),
		function(req, res) {
			res.send(200, 'Logged In!');
		});

	app.get('/auth/facebook/iosCallback',  passport.authenticate('facebook', { failureRedirect: '/' }),
		function(req, res) {
			res.send('Logged in');
		});

	// app.get('/:id(\\d+)/', ensureAuthenticated, function(req, res) {
	// 	res.send(200, req.params.id);
	// 	// console.log(req.k);
	// 	// res.redirect('/home');
	// });

	app.get('/', ensureAuthenticated, function(req, res) {
		res.redirect('/home');
	});
	
	app.get('/index', function(req, res) {
		res.render('index', {});
	});

	app.get('/home', ensureAuthenticated, function(req, res) {
		res.render('home', {});
	});

	app.get('/admin', function(req, res){
		res.render('admin', {});
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/index');
	});

	var onSms = require('./smsHandler.js');
	app.post('onMessage', function(req, res){
		var message = req.body.Body;
		var from = req.body.From;
		onSms(from, message);
		// console.log(req.body);
		res.end('');
		// res.end('<Message>Hello, Mobile Monkey</Message>');
	});

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
