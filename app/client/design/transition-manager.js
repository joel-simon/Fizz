////////////////////////////////////////////////////////////////////////////////
/*
	TransitionManager - manages the screen width transitions
*/
////////////////////////////////////////////////////////////////////////////////

setLayout();

$(window).on('resize', function() {
	setLayout();
});

function setLayout() {
	var width = $(window).width();
	if (width > 1200) {
		collapse = false;
		if ( $('#collapse-list').hasClass('hidden') ) {
			$('#collapse-list').removeClass('hidden');
			$('#collapse').addClass('hidden');
		} else if ( $('#thread-list').hasClass('hidden') ) {
			$('#thread-list').removeClass('hidden');
		}
	} else if (width > 500) {
		collapse = false;
		if ( $('#collapse-list').hasClass('hidden') ) {
			$('#collapse-list').removeClass('hidden');
			$('#collapse').addClass('hidden');
		} else if ( $('#thread-list').hasClass('hidden') ) {
			$('#thread-list').removeClass('hidden');
		}
	} else {
		if ( !$('#collapse-list').hasClass('hidden') && !collapse ) {
			$('#collapse-list').addClass('hidden');
			$('#collapse').removeClass('hidden');
		}
	}
}