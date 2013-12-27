////////////////////////////////////////////////////////////////////////////////
/*
	index-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

$('.signup-facebook').on('click', function() {
	if (window.location.host.indexOf('localhost')!= -1){
		window.top.location.replace('http://localhost:9001/auth/facebook');
	} else {
		window.top.location.replace('http://beaconBeta.com/auth/facebook');
	}
});