////////////////////////////////////////////////////////////////////////////////
/*
	CollapseManager - manages the transition between the scroll-view 
		and the collapse-view
*/
////////////////////////////////////////////////////////////////////////////////

var collapse = false;

$('#collapse').on('click', function() {
	if ( $(window).width() < 500 ) {
		$('#collapse').addClass('hidden');
		$('#collapse-list').removeClass('hidden');
		$('#thread-list').addClass('hidden');
		collapse = true;
	}
});

$('#collapse-list li').on('click', function() {
	var lid = $(this)[0].id;
	var thread = lid.substr(lid.length-1);
	
	if ( $(window).width() < 500 ) {
		$('#collapse').removeClass('hidden');
		$('#collapse-list').addClass('hidden');
		$('#thread-list').removeClass('hidden');
		collapse = false;
	}

	if (!detail) SM.scrollToThread(thread);
});