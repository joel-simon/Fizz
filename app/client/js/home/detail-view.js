////////////////////////////////////////////////////////////////////////////////
/*
	detail-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

var detail = -1;

function backToOverview() {
	location.reload();
}

function createDetailView(event) {
	OMM.clearMap();
	placeAllMarkers(event);
	$('#timelineButton').html('Back');
	if ( !$('#timeline').hasClass('hidden') ) $('#timeline').addClass('hidden');
	OMM.fitMarkersToScreen();

	// Set up Messaging part
	$('#myBeacon').addClass('hidden');
	$('#myMessage').removeClass('hidden');

	var windowHeight = $(window).height();
	var headerHeight = $('#header').height();
	var halfHeight = Math.floor( (windowHeight - headerHeight)/2 );
	$('#map').css('bottom', halfHeight+'px');
	$('#footer').css('height', halfHeight+'px');
}

