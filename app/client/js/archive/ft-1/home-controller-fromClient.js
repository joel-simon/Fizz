
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
	// var lat, lng;

	invited = [];
	group.forEach(function(uid, i) {
		getFbData(uid, function(pic, name) {
			invited.push({id:uid, name:name, pic:pic});
		});
	});
	
	var beacon = {
		'host' : me.id, 
		'lat' : geo.lat, 
		'lng' : geo.lng,  
		'attends' : [],
		'invited' : invited,
		'comments' : [firstComment],
		'title': title
	};
	console.log('SENDING [newBeacon]: ', beacon);
	socket.emit('newBeacon', beacon);
	// clear form
	form.title.value = '';
	form.comment.value = '';
	form.comment.focus();
	form.comment.blur();
});

$('#group-button').on('click', function() {
	$('#groupManager').removeClass('hidden');
});

$('#saveGroup').on('click', function() {
	$('#groupManager').addClass('hidden');
	console.log('SENDING [updateGroup]', group);
	socket.emit('updateGroup', group);
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
		{ 'id':beacon.id, 'host': beacon.host, 
		comment:{'user':user, 'comment':comment} }
	);
}
