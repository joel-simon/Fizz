////////////////////////////////////////////////////////////////////////////////
/*
	Collapse Controller - handles the transition between the scroll-view 
		and the collapse-view
*/
////////////////////////////////////////////////////////////////////////////////

var collapse = false;

$('#collapse').on('click', function() {
	$('#collapse').addClass('hidden');
	collapseThreadList();
});

function setCollapseListener(thread) {
	$('#thread-'+thread).on('click', function() {
		if (collapse) {
			openThreadList();
			SM.scrollToThread(thread);
			$('#collapse').removeClass('hidden');
		}
	});
}

function collapseThreadList() {
	$('.invite-list').addClass('hidden');
	$('.guest-list').addClass('hidden');

	$('.thread-title').css({
		'margin': '0',
		'position': 'static',
	});
	$('.thread').css({
		'height' : 'auto',
		'padding' : '0',
		'border-bottom' : '2px solid gray',
		'background-color' : 'lightgray',
	});

	collapse = true;
}

function openThreadList() {
	$('.invite-list').removeClass('hidden');
	$('.guest-list').removeClass('hidden');

	$('.thread').css({
		'height' : '90vh',
		'padding-top' : '5vh',
		'padding-bottom' : '5vh',
		'border' : 'none',
		'background-color' : 'white',
	});

	// $( $('.thread-title')[0] ).css({
	// 	'margin-top': '-5vh',
	// });

	// $( $('.thread-title')[1] ).css({
	// 	'margin-top': '-55vh',
	// });

	// $('.thread-title').css({
	// 	'position': 'absolute',
	// });

	resetStyle();
	collapse = false;
}