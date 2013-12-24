
$('#logout').on('click', function() {
	var address = window.location.href;
	window.location.pathname = '/logout';
	// console.log(window.location);
	// window.location = address.substr(0, address.indexOf('home'));
});


$('#myBeacon').on('submit', function(e) {
	e.preventDefault();
	var form = this;
	var title = (form.title.value) ? form.title.value : 'My Event!';
	var comment = (form.comment.value) ? form.comment.value : 'first comment'; 
	var firstComment = { 'user':me.id , 'comment':comment };
	var lat, lng;

	if (tempMarker) {
		lat = tempMarker.position.lat();
		lng = tempMarker.position.lng();
	} else {
		lat = currentPosition.lat();
		lng = currentPosition.lng();
	}
	
	var beacon = {
		'id' : null,
		'host' : me.id, 
		'lat' : lat, 
		'lng' : lng,  
		'attends' : [],
		'comments' : [firstComment],
		'title': title
	};
	console.log('SENDING: ', beacon);
	socket.emit('newBeacon', beacon);
});


function joinBeacon(b) {
	if (b.host != me.id && !b.hasGuest(me.id)) {
		socket.emit('joinBeacon', {'id':b.id , 'host':b.host });
	}
}


function disbandBeacon(b) {
	console.trace();
	console.log('delete', b.id);
	socket.emit('deleteBeacon', { 'host':b.host, 'id':b.id });
}

function leaveBeacon(b) {
	socket.emit('leaveBeacon', {'host':b.host, 'id':b.id});
}


function addComment(beacon, comment, poster) {
	beacon.addComment(poster, comment);
	socket.emit('newComment', { 'id':beacon.id, 
		'comment':{'user':poster, 'comment':comment} });
}

