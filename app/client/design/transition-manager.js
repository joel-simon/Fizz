////////////////////////////////////////////////////////////////////////////////
/*
	TransitionManager - manages the transition from scroll-view to detail-view
*/
////////////////////////////////////////////////////////////////////////////////

var detail = false;

$('.thread-title').on('click', function() {
	var $this = $(this);
	var threadID = $this.parent()[0].id;
	var thread = threadID.substr(threadID.length-1);
	if (thread == SM.currentThread && !detail) {
		hideBorderTitles(thread);
		transitionToDetail(thread);
	} else if (detail) {
		transitionFromDetail(thread);
		showBorderTitles(thread);
	}
});

function hideBorderTitles(thread) {
	$('#thread-'+thread).prev().children('.thread-title').addClass('hidden');
	$('#thread-'+thread).next().children('.thread-title').addClass('hidden');
}

function showBorderTitles(thread) {
	$('#thread-'+thread).prev().children('.thread-title').removeClass('hidden');
	$('#thread-'+thread).next().children('.thread-title').removeClass('hidden');
}

function transitionToDetail(thread) {
	$('body').css('overflow', 'hidden');
	$('#thread-list').css('overflow', 'hidden');

	$('#thread-'+thread).css({
		'padding':'0',
		'height':'100vh',
	});
	$('#thread-'+thread).prepend( $('#thread-'+thread+' .thread-title') );
	$('#thread-'+thread+' .message-chain')
		.css({'flex':'2 0 0'})
		.removeClass('hidden');
	$('#thread-'+thread+' .message-form')
		.removeClass('hidden');

	detail = true;
}

function transitionFromDetail(thread) {
	$('body').css('overflow-y', 'auto');
	$('#thread-list').css('overflow-y', 'auto');

	$('#thread-'+thread).css({
		'padding-top':'5vh',
		'padding-bottom':'5vh',
		'height':'90vh',
	});
	$('#thread-'+thread).prepend( $('#thread-'+thread+' .invite-list') );
	$('#thread-'+thread+' .message-chain')
		.css({'flex':'0 1 auto'})
		.addClass('hidden');
	$('#thread-'+thread+' .message-form')
		.addClass('hidden');

	detail = false;
}