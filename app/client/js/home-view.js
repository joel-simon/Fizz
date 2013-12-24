////////////////////////////////////////////////////////////////////////////////
/*
	home-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

// Place FB pic and name
function drawUserInfo(hostPic, hostName) {
	$('#host-pic').attr('src', hostPic);
	$('#host-name').html(hostName);
}


// Draws all necessary viewable parts of the given beacon.
function drawBeacon(beacon) {
	console.log('Drawing:', beacon);
	// console.trace();
	// Place the beacon marker on the google map.
	setBeacon(beacon);

	// if (beacon.pub) {
	// 	// Put the beacon info into the beacon-list.
	// 	createPublicHtmlString(beacon, function(htmlString) {
	// 		// console.log(htmlString);
	// 		$('#beacon-list').prepend(htmlString);
	// 		$('#host-'+beacon.host).on('click', function() {
	// 			if ( beacon.hasGuest(me.id) ) {
	// 				leaveBeacon( beacon, me.id );
	// 			} else {
	// 				joinBeacon( beacon);
	// 			}
	// 		});
	// 	});
	// } else {


	// Put the beacon info into the beacon-list.
	createHtmlString(beacon, function(htmlString) {
		// console.log(htmlString);
		$('#beacon-list').prepend(htmlString);
		$('#beacon-'+beacon.id).on('click', function() {
			if ( beacon.host == me.id ) {
				disbandBeacon( beacon );
			} else if ( beacon.hasGuest(me.id) ) {
				leaveBeacon( beacon, me.id );
			} else {
				joinBeacon( beacon );
			}
		});
		$('#comments-'+beacon.id).on('submit', function() {
			addComment( beacon, this.comment.value, me.id );
		});
	});

}



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


// Removes all visible traces of the beacon!
function eraseBeacon(beacon) {
	// Remove the beacon marker from the google map.
	if (beacon.marker) removeMarker(beacon.marker);

	// Remove the beacon from the beacon-list.
	$('#host-'+beacon.host).parent().remove();
}


function writeBeaconEvent(beacon) {
	var htmlString = 
		'<li class="event">'+
			'<button class="btn btn-primary">Join</button>'+
			'<p class="details">'+beacon.title+'</p>';

	var attending = beacon.attends;
	var dude;
	var c = 0;
	// console.log(beacon);

	getFbData(''+beacon.attends[0], function(pic, name) {
		console.log('host img', pic);
		htmlString += '<img class="host-pic" src="'+pic+'">'+
					'<div class="attending"><div class="horizon">';
		var i = 1;
		while (i < beacon.attends.length) {
			dude = beacon.attends[i];
			getFbData(''+dude, function(pic, name) {
				htmlString += '<img class="guest-pic" src="'+pic+'">';
				i++;
			});
			
		}
		$('#beacon-list').append(htmlString);
		
	});

}


