module.exports = function(app, passport) {
	
	app.get('/auth/facebook',
  passport.authenticate('facebook', { display: 'page', scope: ['user_friends', 'user_groups', 'email'] }),
  function(req, res){
  });

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
	  	var user = req['user'];
	  	res.cookie('userId', user.id, { maxAge: 2592000000 });
	    res.redirect('/home');
  });

	app.get('/iosLogin', function(req, res) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		console.log(query);
		// console.log(req);	
	});



	app.get('/', ensureAuthenticated, function(req, res) {
		res.redirect('/home');
	});

	app.get('/index', function(req, res) {
		res.render('index', {});
	});

	app.get('/home', ensureAuthenticated, function(req, res) {
			res.render('home', {});
	});

	app.get('/admin', function(req, res) {
		res.render('admin', {});
	});

	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/index');
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
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/index');
}