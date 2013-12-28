////////////////////////////////////////////////////////////////////////////////
/*
	home-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

// Place FB pic and name
function drawUserInfo(pic, name) {
	$('#host-pic').attr('src', pic);
	$('#host-name').html(name);
}


// Draws all necessary viewable parts of the given beacon.
function drawBeacon(beacon) {
	getFbData(beacon.host, function(pic, name) {
		createMarker(beacon.id, beacon.lat, beacon.lng, beacon.title, 
			beacon.comments[0].comment, pic);
	});

	// Put the beacon info into the beacon-list.
	createHtmlString(beacon, function(htmlString) {
		// put the beacon onto the html page
		$('#beacon-list').prepend(htmlString);
		// join/leave/disband the beacon depending on the situation
		$('#button-'+beacon.id).on('click', function() {
			if ( beacon.host == me.id ) {
				disbandBeacon( beacon );
			} else if ( beacon.hasGuest(me.id) ) {
				leaveBeacon( beacon, me.id );
			} else {
				joinBeacon( beacon );
			}
		});
		// when the beacon is clicked, pan map over to that beacon
		$('#beacon-'+beacon.id).on('click', function() {
			centerMap(beacon.lat, beacon.lng);
		});
		// add a new comment to the beacon
		$('#newComment-'+beacon.id).on('submit', function(e) {
			e.preventDefault();
			addComment( beacon, this.comment.value, me.id );
			this.comment.value = '';
		});
	});
}

function drawAddedGuest(id, guest) {
	getFbData(guest, function(guestPic, guestName) {
		guestId = 'g-'+id+'-'+guest;
		string = '<img id="'+guestId+'" class="guest-pic" title="'
			+guestName+'" src="'+guestPic+'">';
		$('#beacon-'+id+' .attending').append(string);
	});
	$('#button-'+id)
		.removeClass('btn-primary')
		.addClass('btn-danger')
		.text('Leave');
}

function drawAddedComment(bid, cid, user, comment) {
	var imgString = '<img src="'+fbInfo[user].pic+'">';
	var string = '<p id="c-'+bid+'-'+cid+'">'+imgString+' '+
	 	comment+'</p>';
	$('#beacon-'+bid+' .commentList').append(string);
}


// Removes all visible traces of the beacon!
function eraseBeacon(beacon) {
	removeMarker(beacon.id);

	// Remove the beacon from the beacon-list.
	$('#beacon-'+beacon.id).remove();
}


function eraseRemovedGuest(id, guest) {
	$('#g-'+id+'-'+guest).remove();
	$('#button-'+id)
		.removeClass('btn-danger')
		.addClass('btn-primary')
		.text('Join');
}


