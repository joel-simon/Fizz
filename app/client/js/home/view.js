////////////////////////////////////////////////////////////////////////////////
/*
	view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

// Place User's name and pic
function drawUser(name, pic) {
	$('#host-name').html(name);
	$('#host-pic').attr('src', pic);
}

// Draws all necessary viewable parts of the given beacon.
function drawEvent(event) {
	// Mapbox interaction
	placeAllMarkers(event);

	// Put information into the Timeline's Event List
	addEventToTimeline(event, function(eventHTML, index) {
		if (!timelineList.length || index == -1) {
			$('#event-list').append(eventHTML);
		} else {
			$('eventHTML').prependTo('.guest'+index);
		}
	});

	// // Put the beacon info into the beacon-list.
	// writeEventHTML(event, function(eventHTML) {
	// 	// put the beacon onto the html page
	// 	$('#event-list').prepend(eventHTML);
	// 	// join/leave/disband the beacon depending on the situation
	// 	$('#button-'+event.eid).on('click', function() {
	// 		if ( (event.host === MIM.uid) || event.hasGuest(MIM.uid) ) {
	// 			leaveEvent(event, MIM.uid);
	// 		} else {
	// 			joinEvent(event);
	// 		}
	// 	});
	// 	// when the beacon is clicked, pan map over to that beacon
	// 	$('#event-'+event.eid).on('click', function() {
	// 		console.log('EVENT CLICKED:', event);
	// 	});
	// 	// add a new message to the beacon
	// 	$('#newMessage-'+event.eid).on('submit', function(e) {
	// 		e.preventDefault();
	// 		newMessage(event.eid, this.message.value, null);
	// 		this.message.value = '';
	// 	});
	// });
}

function drawGuest(eid, uid) {
	var guest = ELM.getEvent(eid).getUser(uid);
	getFacebookInfo(guest.fbid, function(name, pic) {
		guestId = 'g-'+eid+'-'+guest.uid;
		string = '<img id="'+guestId+'" class="guest-pic" title="'
			+name+'" src="'+pic+'">';
		$('#event-'+eid+' .guestList').append(string);
	});
	if (MIM.uid === uid) {
		$('#button-'+eid)
			.removeClass('btn-primary')
			.addClass('btn-danger')
			.text('Leave');
	}
}

function drawMessage(message) {
	if (message.marker) mapMessage(message);

	var event = ELM.getEvent(message.eid);
	var user  = event.getUser(message.uid);
	getFacebookInfo(user.fbid, function(name, pic) {
		var imgString = '<img src="'+pic+'" class="pic" title="'+name+'">';
		var string = 
			'<p id="m-'+event.eid+'-'+message.mid+'">'+
				imgString+' '+message.text+
			'</p>';
		$('#event-'+event.eid+' .messageList').append(string);
	});
}

function eraseEvent(event) {
	deleteAllMarkers(event.eid);

	// Remove the event from the event-list.
	$('#event-'+event.eid).remove();
}

function eraseGuest(eid, uid) {
	$('#g-'+eid+'-'+uid).remove();
	if (uid === MIM.uid) {
		$('#button-'+eid)
			.removeClass('btn-danger')
			.addClass('btn-primary')
			.text('Join');	
	}
}


