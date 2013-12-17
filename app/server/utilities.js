var colors  = require('colors');
var fs = require('fs');
var debug = false;

colors.setTheme({
  info: 'rainbow',
  debug: 'blue',
  error: 'red',
  data: 'grey'
});

module.exports.log = function() {
	var s = '\tInfo: ';
	var e;
	for (var i = 0; i < arguments.length; i++) {
		e = arguments[i];
		s += ((e instanceof Object) ? JSON.stringify(e) : e)+' ';
	}
	console.log(s.data);
}

module.exports.debug = function() {
	if(!debug) return;
	var s = '\tInfo: ';
	var e;
	for (var i = 0; i < arguments.length; i++) {
		e = arguments[i];
		s += ((e instanceof Object) ? JSON.stringify(e) : e)+' ';
	}
	console.log(s.debug);
}

module.exports.logError = function(err, detail) {
	var s = 'Error @ '+(new Date()) + '\n';
	console.log('\tError:'.error, err);
	
	if (detail) {
		if (detail instanceof Object) detail = JSON.stringify(detail);		
		s += ('\t' + err + '\n\t' + detail + '\n\n');
	} else {
		s += ('\t' + err + '\n\n');
	}
  
  fs.appendFile("./err.txt", s, function(err2) {
    if(err2) {
      console.log(err2);
    }
	}); 
}