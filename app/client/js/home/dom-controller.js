////////////////////////////////////////////////////////////////////////////////
/*
	DOM Controller - listens for interaction intended to communicate with 
		the server
*/
////////////////////////////////////////////////////////////////////////////////

function setMessageFormListener(eid) {
	$('#mf-'+eid).on('submit', function(e) {
		e.preventDefault();
		var messageData = {
			eid : eid,
			text : this.message.value,
		};
		console.log('SENDING [newMessage]:', messageData);
		socket.emit('newMessage', messageData);
		this.message.value = '';
	});
}