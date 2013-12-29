////////////////////////////////////////////////////////////////////////////////
/*
	home-html.js - Creates HTML strings for home-view.js draw functions
*/
////////////////////////////////////////////////////////////////////////////////


// Helper function for drawBeacon.
function createHtmlString(beacon, callback) {
	console.log(beacon.host, me.id);
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
		'<li class="event" id="beacon-'+beacon.id+'">'+
			'<button id="button-'+beacon.id+'" class="btn '+color+'">'+
				label+
			'</button>'+
			'<p class="title">'+beacon.title+'</p>';

	// Gets and displays the host info.
	getFbData(beacon.host, function(hostPic, hostName) {
		htmlString += '<img class="host-pic" title="'+hostName+'" src="'+hostPic+'">'+
			'<div class="attending">';

		getAttendsString(beacon, function(attendsString) {
			htmlString += attendsString;
			getCommentsString(beacon, function(commentsString) {
				htmlString += commentsString;
				htmlString += 
						'<form id="newComment-'+beacon.id+'">'+
							'<input type="text", name="comment", placeholder="Write a comment">'+
						'</form>'+
					'</li>';
				callback(htmlString);
			});
		});
	});
}


function getAttendsString(beacon, callback) {
	var counter = 0;
	var string = '';
	var guestId;
	if (beacon.attends.length) {
		// Loops through the guests and gets and displays their info.
		beacon.attends.forEach(function(guest, i) {
			getFbData(guest, function(guestPic, guestName) {
				guestId = 'g-'+beacon.id+'-'+guest;
				string += '<img id="'+guestId+'" class="guest-pic" title="'+
					guestName+'" src="'+guestPic+'">';
				if (++counter == beacon.attends.length) {
					string += '</div>';
					callback(string);
					return;
				}
			});
		});
	} else {
		string += '</div>';
		callback(string);
		return;
	}
}


function getCommentsString(beacon, callback) {
	var counter = 0;
	var string = '<div class="commentList">';
	var comId, guestPic, imgString;
	if (beacon.comments.length) {
		beacon.comments.forEach(function(com, i) {
			comId = com.id || i;
			getFbData(com.user, function(pic, name) {
				imgString = '<img src="'+pic+'">';
				string += '<p id="c-'+beacon.id+'-'+comId+'">'+imgString+
					' '+com.comment+'</p>';
				if (++counter == beacon.comments.length) {
					string += '</div>';
					callback(string);
					return;
				}
			});
		});
	} else {
		string += '</div>';
		callback(string);
		return;
	}
}




