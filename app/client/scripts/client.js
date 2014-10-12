var userHtml;
$(document).ready(function (argument) {
	userHtml = $('.guestlist >>').get().filter(function(li){
		return $(li).text() == user.name;
	})[0]

	console.log('foo',$('.description'));
	$('.description').on('touchstart click', function(e) {
		if (accepted && confirm('Leave this event?')) {
			console.log('test');
			$.ajax({
			  type: "POST",
			  url: '/leave',
			  data: { key: key },
			  success: function (foo) {
			  	console.log($('.rsvp h1'));
			  	$('.noReply').append(userHtml)
					$('.rsvp h1').text('Click anywhere to join')
			  	accepted = false;
			  },
			  fail: function(err){
			  	console.log('there was an error', err);
			  }
			});
		} else if (confirm('Join this event?')) {
			$.ajax({
			  type: "POST",
			  url: '/Join',
			  data: { key: key },
			  success: function (foo) {
			  	$('.rsvp h1').text('You are attending')
			  	$('.interested').append(userHtml)
			  	accepted = true;
			  }
			});
		}
	});
});