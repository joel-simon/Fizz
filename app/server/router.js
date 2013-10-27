module.exports = function(app) {

// main login page //

	app.get('/', function(req, res) {
		res.render('index', {});
	})

	app.get('/home', function(req, res) {
		res.render('home', {});
	})

	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};