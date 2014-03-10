////////////////////////////////////////////////////////////////////////////////
/*
	controller.js - Interfaces with the User
*/
////////////////////////////////////////////////////////////////////////////////

$('#logout').on('click', function() {
	var address = window.location.href;
	window.location.pathname = '/logout';
});

$('#timelineButton').on('click', function() {
	if ( $('#timelineButton').html() == 'Back' ) {
		backToOverview();
	} else if ( $('#timeline').hasClass('hidden') ) {
		$('#timeline').removeClass('hidden');
		$('#timelineButton').html('Map View');
	} else {
		$('#timeline').addClass('hidden');
		$('#timelineButton').html('Timeline');
	}
});

$('#invite').on('click', function(e) {
	e.preventDefault();
	$('#inviteManager').removeClass('hidden');
});

$('#searchFriendList').on('input', function() {
    
});

$('#foursquare').on('submit', function(e) {
	e.preventDefault();
	// console.log(this.venue.value);
	queryFoursquare(this.venue.value);
});

$('#closeInviteManager').on('click', function(e) {
	e.preventDefault();
	$('#inviteManager').addClass('hidden');
});

$('#myBeacon').on('submit', function(e) {
	e.preventDefault();
	var form    = this;
	var text    = (form.message.value) ? form.message.value : 'Description!';
	var now     = Date.now();
	var marker  = getTempMarker();
	var message = {
		mid          : 0,
		eid          : 0,
		uid          : MIM.uid,
		text         : text,
		creationTime : now,
		marker       : marker,
	};
	var eventData = {
		creationTime : now,
		inviteList   : [],
		invitePnList : [],
		message      : message,
	};
	console.log('SENDING [newEvent]: ', eventData);
	socket.emit('newEvent', eventData);
	// clear map and form
	removeTempMarker();
	form.message.value = '';
	form.message.focus();
	form.message.blur();
});

function joinEvent(event) {
	console.log('SENDING [joinEvent]: ', event.eid);
	socket.emit('joinEvent', {eid : event.eid});
}

function leaveEvent(event) {
	console.log('SENDING [leaveEvent]: ', event.eid);
	socket.emit('leaveEvent', {eid : event.eid});
}

function newMessage(eid, text, marker) {
	var message = {
		mid          : 0,
		eid          : eid,
		uid          : MIM.uid,
		text         : text,
		creationTime : Date.now(),
		marker       : marker,
	};
	console.log('SENDING [newMessage]: ', message);
	socket.emit('newMessage', {message : message});
}

