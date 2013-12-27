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
	// Place the beacon marker on the google map.
	setBeacon(beacon);

	// Put the beacon info into the beacon-list.
	createHtmlString(beacon, function(htmlString) {
		// console.log(htmlString);
		$('#beacon-list').prepend(htmlString);
		$('#button-'+beacon.id).on('click', function() {
			if ( beacon.host == me.id ) {
				disbandBeacon( beacon );
			} else if ( beacon.hasGuest(me.id) ) {
				leaveBeacon( beacon, me.id );
			} else {
				joinBeacon( beacon );
			}
		});
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

function drawAddedComment(id, com) {
	// comId = com.id || i;
	// string += '<p id="c-'+beacon.id+'-'+comId+'">'+com.user+': '
	// 	+com.comment+'</p>';
	// if (++counter == beacon.comments.length) {
	// 	string += '</div>';
	// 	callback(string);
	// 	return;
	// }
}


// Removes all visible traces of the beacon!
function eraseBeacon(beacon) {
	// Remove the beacon marker from the google map.
	if (beacon.marker) removeMarker(beacon.marker);

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


