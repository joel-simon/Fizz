////////////////////////////////////////////////////////////////////////////////
/*
	CollapseManager - manages the transition between the scroll-view 
		and the collapse-view
*/
////////////////////////////////////////////////////////////////////////////////

var collapse = false;

$('#collapse').on('click', function() {
	$('#collapse').addClass('hidden');
	collapseThreadList();
});

$('.thread').on('click', function() {
	if (collapse) {
		var threadID = $(this)[0].id;
		var thread = threadID.substr(threadID.length-1);
		openThreadList();
		SM.scrollToThread(thread);
		$('#collapse').removeClass('hidden');
	}
});

function collapseThreadList() {
	$('.invite-list').css('flex','0 1 auto').addClass('hidden');
	$('.guest-list').css('flex','0 1 auto').addClass('hidden');

	$('.thread-title').css('margin','0');
	$('.thread').css({
		'height'  : 'auto',
		'padding' : '0',
		'border-bottom' : '2px solid gray',
		'background-color' : 'lightgray',
	});

	collapse = true;
}

function openThreadList() {
	$('.invite-list').css('flex','1 0 0').removeClass('hidden');
	$('.guest-list').css('flex','1 0 0').removeClass('hidden');

	$('.thread').css({
		'height'  : '90vh',
		'padding-top' : '5vh',
		'padding-bottom' : '5vh',
		'border' : 'none',
	});

	collapse = false;
}