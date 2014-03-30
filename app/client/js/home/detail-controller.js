////////////////////////////////////////////////////////////////////////////////
/*
	Detail Controller - handles the transition between the scroll-view 
		and the detail-view
*/
////////////////////////////////////////////////////////////////////////////////

var detail = false;

function setDetailListener(eid) {
	$('#mf-'+eid).closest( $('.thread') ).children('.thread-title').on('click', function() {
		var threadID = $(this).parent()[0].id;
		var thread = threadID.substr(7);
		if (thread == SM.currentThread && !detail && !collapse) {
			hideBorderTitles(thread);
			transitionToDetail(thread);
		} else if (detail) {
			transitionFromDetail(thread);
			showBorderTitles(thread);
		}
	});
}

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
	$('#thread-'+thread+' .thread-title').css({'margin-top':'0vh'});
	$('#thread-'+thread+' .message-chain')
		.css({'height':'50vh'})
		.removeClass('hidden');
	$('#thread-'+thread+' .message-form')
		.removeClass('hidden');

	$('#thread-'+thread+' .invite-list').css('height', '25vh');
	$('#thread-'+thread+' .guest-list').css('height', '25vh');

	$('#collapse').addClass('hidden');

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
	$('#thread-'+thread+' .thread-title').css({'margin-top':'-5vh'});
	$('#thread-'+thread+' .message-chain')
		.css({'height':'0'})
		.addClass('hidden');
	$('#thread-'+thread+' .message-form')
		.addClass('hidden');

	$('#thread-'+thread+' .invite-list').css('height', '45vh');
	$('#thread-'+thread+' .guest-list').css('height', '45vh');

	$('#collapse').removeClass('hidden');

	detail = false;
}