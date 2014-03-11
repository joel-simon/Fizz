////////////////////////////////////////////////////////////////////////////////
/*
	index-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

$('.signup-facebook').on('click', function() {
	var s = 'auth/facebook';
	pathArray = window.location.href.split( '/' );
	protocol = pathArray[0];
	host = pathArray[2];
	url = protocol + '//' + host;
	console.log(url);
	window.top.location.replace(protocol+'/auth/facebook');

	// if (window.location.host.indexOf('localhost')!= -1){
	// 	window.top.location.replace('http://localhost:9001/auth/facebook');
	// } else {
	// 	window.top.location.replace('http://beaconBeta.com/auth/facebook');
	// }
});