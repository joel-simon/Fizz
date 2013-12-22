module.exports = function(app, passport) {
	
	app.get('/auth/facebook',
  passport.authenticate('facebook', { display: 'popup', scope: ['user_friends', 'user_groups', 'email'] }),
  function(req, res){
  });

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
	  	var user = req['user'];
	  	// var user = req.session;
	  	res.cookie('userId', user.id, { maxAge: 2592000000 });
	  	// res.cookie('userName', user.id, { maxAge: 2592000000 });
	    res.redirect('/home');
  });


	app.get('/', function(req, res) {
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
	  res.redirect('/');
	});

	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}