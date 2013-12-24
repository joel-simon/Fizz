////////////////////////////////////////////////////////////////////////////////
/*
	Facebook SDK - contains all the code responsible for connecting the app to
		Facebook when logging in and checking information. In future, this will
		also contain code for posting Beacons to Facebook as well as other 
		features.
*/
////////////////////////////////////////////////////////////////////////////////

var me; // the Facebook ID of the User of this instance of the Beacon website.

/**
 * Connects the Beacon website to the Beacon App on Facebook.
 */
window.fbAsyncInit = function() {
	if (window.location.origin.match('localhost')) var id = '182282665307149'
	else var id = '451762954934201'
	console.log(id);
	// init the FB JS SDK
	FB.init({
		appId      : id,                                   // App ID from the app dashboard
		channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
		status     : true,                                 // Check Facebook Login status
		xfbml      : true                                  // Look for social plugins on the page
	});

	// Additional initialization code such as adding Event Listeners goes here
	if ( document.getElementById('facebook-jssdk') 
		&& (window.location.href.indexOf('admin') == -1) ) {
		console.log('FB SDK is ready!');
		FB.getLoginStatus(function(response) {
			console.log(response);
			if (response.status === 'connected') {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;
				login();

				if (window.location.href.indexOf('home') == -1) {
					window.location+='home/';
				}

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

/** 
 * Loads the Facebook SDK asynchronously once the HTML document is ready.
 */
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/**
 * Fetches the User's Facebook ID upon logging into Beacon, and displays the
 * User's info on the website.
 */
function login() {
	console.log('Welcome!!! Fetching your data...');
	FB.api('/me', function(response) {
		me = response;
		getFriends(function(friends){
			socket.emit('login', {'id': me.id, 'friends': friends});
		});
		
		getFbData(me.id, function(hostPic, hostName) {
			console.log('host stuff: ', hostPic, hostName);
			drawUserInfo(hostPic, hostName);
		});
	});

}

/**
 * Returns the Facebook picture and name of a particular Beacon User.
 * @param {string} id - The ID of the User that's information is being requested.
 * @param {function} callback - Expects the Facebook picture url and name string
 *     to be passed in.
 */
function getFbData(id, callback) {
	// console.log(id);
	if (id === 'admin') return null;
	FB.api('/'+id+'?fields=picture,name', function(response) {
		console.log(response);
		callback(response.picture.data.url, response.name);
		// console.log('fbData', response.picture.data.url);
	});
}

/**
 * Depricated
 */
// function getFriends(callback) {
// 	FB.api('/me/friends', function(response) {
// 		var friends = [];
// 		response.data.forEach(function(elem, i) {
// 			friends.push(elem.id);
// 		});
// 		callback(friends)
// 	});
// }

