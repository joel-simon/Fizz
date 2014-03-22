////////////////////////////////////////////////////////////////////////////////
/*
	DOM Controller - listens for interaction intended to communicate with 
		the server
*/
////////////////////////////////////////////////////////////////////////////////

function setMessageFormListener(thread) {
	$('#thread-'+thread+' .message-form').on('submit', function(e) {
		e.preventDefault();
		var messageData = {
			eid : thread,
			text : this.message.value,
		};
		console.log('SENDING [newMessage]:', messageData);
		socket.emit('newMessage', messageData);
		this.message.value = '';
	});
}