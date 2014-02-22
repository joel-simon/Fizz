////////////////////////////////////////////////////////////////////////////////
/*
	eventList-html.js - creates HTML strings for views
*/
////////////////////////////////////////////////////////////////////////////////

function writeEventHTML(event, callback) {
	var color, label;
	if ( (event.host == MIM.uid) || event.hasGuest(MIM.uid) ) {
		color = 'btn-danger';
		label = 'Leave';
	} else {
		color = 'btn-primary';
		label = 'Join';
	}
	var eventHTML = 
		'<li class="event" id="event-'+event.eid+'">'+
			'<button id="button-'+event.eid+'" class="btn '+color+'">'+
				label+
			'</button>';

	// Gets and displays the host info.
	writeGuestListHTML(event, function(guestListHTML) {
		eventHTML += guestListHTML;
		writeMessageListHTML(event, function(messageListHTML) {
			eventHTML += messageListHTML;
			eventHTML += 
					'<form id="newMessage-'+event.eid+'">'+
						'<input type="text", autocomplete="off", name="message", placeholder="Write a message!">'+
					'</form>'+
				'</li>';
			callback(eventHTML);
		});
	});
}

function writeGuestListHTML(event, callback) {
	var counter = 0;
	var string = '<div class="guestList">';
	var guestId;
	if (event.guestList.length) {
		event.guestList.forEach(function(uid, i) {
			var guest = event.getUser(uid);
			getFacebookInfo(guest.fbid, function(name, pic) {
				guestId = 'g-'+event.eid+'-'+guest.uid;
				string += '<img id="'+guestId+'" class="guest-pic pic" title="'+name+'" src="'+pic+'">';
				if (++counter == event.guestList.length) {
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

function writeMessageListHTML(event, callback) {
	var counter = 0;
	var string = '<div class="messageList">';
	var mid, user, imgString;
	if (event.messageList.length) {
		event.messageList.forEach(function(message, i) {
			mid  = message.mid;
			user = event.getUser(message.uid);
			getFacebookInfo(user.fbid, function(name, pic) {
				imgString = '<img class="pic" title="'+name+'" src="'+pic+'">';
				string += 
					'<p id="m-'+event.eid+'-'+mid+'">'+
						imgString+' '+message.text+
					'</p>';
				if (++counter == event.messageList.length) {
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


