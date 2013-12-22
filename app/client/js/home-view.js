////////////////////////////////////////////////////////////////////////////////
/*
	home-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////
function hasGuest(b, guest) {
	for (var i = 0; i < b.attends.length; i++) {
		if (b.attends[i] == guest) {
			// console.log('you are a guest!');
			return true;
		}
	}
	// console.log('you are not a guest!');
	return false;
}

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

	if (beacon.pub) {

		// Put the beacon info into the beacon-list.
		createPublicHtmlString(beacon, function(htmlString) {
			// console.log(htmlString);
			$('#beacon-list').prepend(htmlString);
			$('#host-'+beacon.host).on('click', function() {
				if ( hasGuest(beacon, me.id) ) {
					leaveBeacon( beacon, me.id );
				} else {
					joinBeacon( beacon);
				}
			});
		});

	} else {

		// Put the beacon info into the beacon-list.
		createHtmlString(beacon, function(htmlString) {
			// console.log(htmlString);
			$('#beacon-list').prepend(htmlString);
			$('#host-'+beacon.host).on('click', function() {
				if ( beacon.host == me.id ) {
					disbandBeacon( beacon );
				} else if ( hasGuest(beacon, me.id) ) {
					leaveBeacon( beacon, me.id );
				} else {
					joinBeacon( beacon );
				}
			});
		});

	}
}

// Helper function for drawBeacon.
function createPublicHtmlString(beacon, callback) {
	var color, label;
	if ( hasGuest(beacon, me.id) ) {
		color = 'btn-danger';
		label = 'Leave';
	} else {
		color = 'btn-primary';
		label = 'Join';
	}
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+'" id="host-'+beacon.host+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.title+'</p>';

	var counter = 0;
	// Gets and displays the host info.
	
	htmlString += '<img class="host-pic" title="'+beacon.host+'" src="/img/party2.png">'+
		'<div class="attending"><div class="horizon">';

	if (beacon.attends.length) {
		// Loops through the guests and gets and displays their info.
		beacon.attends.forEach(function(guest, i) {
			getFbData(guest, function(guestPic, guestName) {
				htmlString += '<img class="guest-pic" title="'+guestName+'" src="'+guestPic+'">';
				if (++counter == beacon.attends.length) {
					htmlString += '</div></div></li>';
					callback(htmlString);
					return;
				}
			});
		});
	} else {
		htmlString += '</div></div></li>';
		callback(htmlString);
		return;
	}
	
}

// Helper function for drawBeacon.
function createHtmlString(beacon, callback) {
	var color, label;
	if ( beacon.host == me.id ) {
		color = 'btn-danger';
		label = 'Disband';
	} else if ( hasGuest(beacon, me.id) ) {
		color = 'btn-danger';
		label = 'Leave';
	} else {
		color = 'btn-primary';
		label = 'Join';
	}
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+'" id="host-'+beacon.host+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.title+'</p>';

	var counter = 0;
	// Gets and displays the host info.
	getFbData(beacon.host, function(hostPic, hostName) {
		htmlString += '<img class="host-pic" title="'+hostName+'" src="'+hostPic+'">'+
			'<div class="attending"><div class="horizon">';

		if (beacon.attends.length) {
			// Loops through the guests and gets and displays their info.
			beacon.attends.forEach(function(guest, i) {
				getFbData(guest, function(guestPic, guestName) {
					htmlString += '<img class="guest-pic" title="'+guestName+'" src="'+guestPic+'">';
					if (++counter == beacon.attends.length) {
						htmlString += '</div></div></li>';
						callback(htmlString);
						return;
					}
				});
			});
		} else {
			htmlString += '</div></div></li>';
			callback(htmlString);
			return;
		}
	});
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


