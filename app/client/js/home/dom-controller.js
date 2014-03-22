////////////////////////////////////////////////////////////////////////////////
/*
	DOM Controller - listens for interaction intended to communicate with 
		the server
*/
////////////////////////////////////////////////////////////////////////////////

function setMessageFormListener(thread) {
	$('#thread-'+thread+' .message-form').on('submit', function(e) {
		e.preventDefault();
		console.log('Thread '+thread+': '+this.message.value);
		this.message.value = '';
	});
}