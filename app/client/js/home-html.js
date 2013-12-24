////////////////////////////////////////////////////////////////////////////////
/*
	home-html.js - Creates HTML strings for home-view.js draw functions
*/
////////////////////////////////////////////////////////////////////////////////


// Helper function for drawBeacon.
function createHtmlString(beacon, callback) {
	var color, label;
	if ( beacon.host == me.id ) {
		color = 'btn-danger';
		label = 'Disband';
	} else if ( beacon.hasGuest(me.id) ) {
		color = 'btn-danger';
		label = 'Leave';
	} else {
		color = 'btn-primary';
		label = 'Join';
	}
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+'" id="beacon-'+beacon.id+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.title+'</p>';

	// Gets and displays the host info.
	getFbData(beacon.host, function(hostPic, hostName) {
		htmlString += '<img class="host-pic" title="'+hostName+'" src="'+hostPic+'">'+
			'<div class="attending"><div class="horizon">';

		getAttendsString(beacon, function(attendsString) {
			htmlString += attendsString;
			getCommentsString(beacon, function(commentsString) {
				htmlString += commentsString;
				htmlString += 
						'<form id="comments-'+beacon.id+'">'+
							'<input type="text", name="comment", placeholder="Write a comment">'+
						'</form>'+
					'</li>';
				// console.log(htmlString);
				callback(htmlString);
			});
		});
	});
}


function getAttendsString(beacon, callback) {
	var counter = 0;
	var string = '';
	if (beacon.attends.length) {
		// Loops through the guests and gets and displays their info.
		beacon.attends.forEach(function(guest, i) {
			getFbData(guest, function(guestPic, guestName) {
				string += '<img class="guest-pic" title="'+guestName+'" src="'+guestPic+'">';
				if (++counter == beacon.attends.length) {
					string += '</div></div>';
					callback(string);
					return;
				}
			});
		});
	} else {
		string += '</div></div>';
		callback(string);
		return;
	}
}


function getCommentsString(beacon, callback) {
	var counter = 0;
	var string = '<div id="commentList">';
	if (beacon.comments.length) {
		beacon.comments.forEach(function(com, i) {
			string += '<p>'+com.user+': '+com.comment+'</p>';
			if (++counter == beacon.comments.length) {
				string += '</div>';
				callback(string);
				return;
			}
		});
	} else {
		string += '</div>';
		callback(string);
		return;
	}
}




