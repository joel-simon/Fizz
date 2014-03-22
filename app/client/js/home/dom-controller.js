////////////////////////////////////////////////////////////////////////////////
/*
	DOM Controller - listens for interaction intended to communicate with 
		the server
*/
////////////////////////////////////////////////////////////////////////////////

function setMessageFormListener(thread, eid) {
	$('#thread-'+thread+' .message-form').on('submit', function(e) {
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