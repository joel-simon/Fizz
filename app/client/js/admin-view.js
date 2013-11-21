////////////////////////////////////////////////////////////////////////////////
/*
	admin-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////


// Draws all necessary viewable parts of the given beacon.
function drawBeacon(beacon) {
	// console.log('Drawing:', beacon);
	// console.trace();
	// Place the beacon marker on the google map.
	setBeacon(beacon);

	console.log('drawing', beacon);

	if (beacon.pub) {

		// Put the beacon info into the beacon-list.
		createPublicHtmlString(beacon, function(htmlString) {
			// console.log(htmlString);
			$('#beacon-list').prepend(htmlString);
			$('#host-'+beacon.host).on('click', function() {
				console.log('clicked the damn button.');
				disbandBeacon( beacon.host, true );
			});
		});

	} else {

		// Put the beacon info into the beacon-list.
		createHtmlString(beacon, function(htmlString) {
			// console.log(htmlString);
			$('#beacon-list').prepend(htmlString);
			$('#host-'+beacon.host).on('click', function() {
				disbandBeacon( beacon.host, false );
			});
		});

	}
}


// Helper function for drawBeacon.
function createPublicHtmlString(beacon, callback) {
	var color = 'btn-danger';
	var label = 'Disband';
	
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+'" id="host-'+beacon.host+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.desc+'</p>';

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
	var color = 'btn-danger';
	var label = 'Disband';
	
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+'" id="host-'+beacon.host+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.desc+'</p>';


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
			'<p class="details">'+beacon.desc+'</p>';

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


$('#removePublic').on('click', function() {

});


$('#removeAll').on('click', function() {
	// for (var beacon in BKeeper.table) {	
	// }
});





