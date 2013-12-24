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
	// Place the beacon marker on the google map.
	setBeacon(beacon);


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


// Removes all visible traces of the beacon!
function eraseBeacon(beacon) {
	// Remove the beacon marker from the google map.
	if (beacon.marker) removeMarker(beacon.marker);

	// Remove the beacon from the beacon-list.
	$('#host-'+beacon.host).parent().remove();
}


