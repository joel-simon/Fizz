// facebook SDK

window.fbAsyncInit = function() {
	// init the FB JS SDK
	FB.init({
		appId      : '202764579903268',                    // App ID from the app dashboard
		channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
		status     : true,                                 // Check Facebook Login status
		xfbml      : true                                  // Look for social plugins on the page
	});

	// Additional initialization code such as adding Event Listeners goes here
	if (document.getElementById('facebook-jssdk')) {
		console.log('FB SDK is ready!');
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;

				window.location+='home/';

				// console.log('i is logged in');
				// FB.api('/'+uid+'?fields=picture,name', function(response) {
				// 	console.log(response, uid);
				// 	// callback(response.picture.data.url, response.name);
				// });
				// FB.logout(function(response) {
				//   // user is now logged out
				// });
			} else if (response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but has not authenticated your app
			} else {
				// the user isn't logged in to Facebook.
			}
		});
	}
};

// Load the SDK asynchronously
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));