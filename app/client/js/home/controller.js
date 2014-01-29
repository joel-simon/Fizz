////////////////////////////////////////////////////////////////////////////////
/*
	controller.js - Interfaces with the User
*/
////////////////////////////////////////////////////////////////////////////////

$('#logout').on('click', function() {
	var address = window.location.href;
	window.location.pathname = '/logout';
});

$('#myBeacon').on('submit', function(e) {
	e.preventDefault();
	var form    = this;
	var text    = (form.message.value) ? form.message.value : 'Description!';
	var now     = Date.now();
	var message = {
		mid              : 0,
		eid              : 0,
		uid              : MIM.uid,
		text             : text,
		creationTime     : now,
		marker           : null,
		deletePastMarker : 0,
	};
	var eventData = {
		creationTime : now,
		inviteList   : [],
		invitePnList : [],
		message      : message,
	};
	console.log('SENDING [newEvent]: ', eventData);
	socket.emit('newEvent', eventData);
	// clear form
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
		mid              : 0,
		eid              : eid,
		uid              : MIM.uid,
		text             : text,
		creationTime     : Date.now(),
		marker           : null,
		deletePastMarker : 0,
	};
	console.log('SENDING [newMessage]: ', message);
	socket.emit('newMessage', {message : message});
}

