////////////////////////////////////////////////////////////////////////////////
/*
	CollapseManager - manages the transition between the scroll-view 
		and the collapse-view
*/
////////////////////////////////////////////////////////////////////////////////

$('#collapse').on('click', function() {
	$('#collapse').addClass('hidden');
	$('#collapse-list').removeClass('hidden');
	$('#thread-list').addClass('hidden');
});

$('#collapse-list li').on('click', function() {
	var lid = $(this)[0].id;
	var thread = lid.substr(lid.length-1);
	
	$('#collapse').removeClass('hidden');
	$('#collapse-list').addClass('hidden');
	$('#thread-list').removeClass('hidden');

	SM.scrollToThread(thread);
});