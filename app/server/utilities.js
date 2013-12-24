var colors  = require('colors');
var fs = require('fs');
var debug = true;


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

module.exports.posInt = posInt;
function posInt(i) {
	return ((typeof i === 'number') && (i%1 === 0) && (i >= 0));
}
/** Verify  a beacon.
 * 
 * @param {Object} B - the beacon to insert
 * @return {Bool} - if it is a valid beacon
 */
module.exports.validate = function (b) {
  if (!posInt(b.id)) return false;
  if (typeof b.host !== 'string') return false;
  if (typeof b.title !== 'string') return false;
  if (!b.lat  || typeof b.lat  !== 'number') return false;
  if (!b.lng  || typeof b.lng  !== 'number') return false;
  // if (typeof b.pub  !== 'boolean')  return false;
  if (!(b.attends && b.attends instanceof Array)) return false;
  if (!(b.comments && b.comments instanceof Array)) return false;
  return true;
}