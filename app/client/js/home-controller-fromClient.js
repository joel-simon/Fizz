
$('#logout').on('click', function() {
	var address = window.location.href;
	window.location.pathname = '/logout';
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
		'host' : me.id, 
		'lat' : lat, 
		'lng' : lng,  
		'attends' : [],
		'comments' : [firstComment],
		'title': title
	};
	console.log('SENDING [newBeacon]: ', beacon);
	socket.emit('newBeacon', beacon);
});


function joinBeacon(b) {
	if (b.host != me.id && !b.hasGuest(me.id)) {
		console.log('SENDING [joinBeacon]: ', b.host, b.id);
		socket.emit('joinBeacon', {'id':b.id , 'host':b.host });
	}
}

function leaveBeacon(b) {
	console.log('SENDING [leaveBeacon]: ', b.host, b.id);
	socket.emit('leaveBeacon', {'host':b.host, 'id':b.id});
}


function disbandBeacon(b) {
	console.log('SENDING [deleteBeacon]: ', b.host, b.id);
	socket.emit('deleteBeacon', { 'host':b.host, 'id':b.id });
}


function addComment(beacon, comment, user) {
	console.log('SENDING [addComment]: ', beacon.id, user, comment);
	socket.emit('newComment', 
		{ 'id':beacon.id, 'host': beacon.host, comment:{'user':user, 'comment':comment} }
	);
}

