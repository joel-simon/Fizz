var userHtml;
$(document).ready(function (argument) {
	userHtml = $('.guestlist >>').get().filter(function(li){
		return $(li).text() == user.name;
	})[0]

	$('.rsvp').on('touchstart click', function(e) {
		if (accepted && confirm('Leave this event?')) {
			$.ajax({
			  type: "POST",
			  url: '/leave',
			  data: { key: key },
			  success: function (foo) {
			  	console.log($('.rsvp h1'));
					$('.rsvp a').text('Join Event')
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
			  	$('.rsvp a').text('Leave Event')
			  	accepted = true;
			  }
			});
		}
	});
});