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
	console.log('DETAIL VIEW: '+event.eid, event);
	if ( !$('#timeline').hasClass('hidden') ) $('#timeline').addClass('hidden');
	$('#myBeacon').addClass('hidden');
	$('#myMessage').removeClass('hidden');

	var windowHeight = $(window).height();
	var headerHeight = $('#header').height();
	var halfHeight = Math.floor( (windowHeight - headerHeight)/2 );
	$('#map').css('bottom', halfHeight+'px');
	$('#footer').css('height', halfHeight+'px');

	OMM.clearMap();
	placeAllMarkers(event);
	$('#timelineButton').html('Back');
	OMM.fitMarkersToScreen();

	drawEventDetails(event);
}

function drawEventDetails(event) {
	event.messageList.forEach(function(message, i) {
		var sender = event.getUser(message.uid);
		getFacebookInfo(sender.fbid, function(name, pic) {
			drawMessage(message, name, pic);
		});
	});
}

function drawMessage(message, name, pic) {
	var messageHTML = 
		'<li id="'+message.eid+'-'+message.mid+'">'+
			'<img class="float-left" src="'+pic+'" title="'+name+'">'+
			'<p>'+name+' - '+message.creationTime+'</p>'+
			'<p>'+message.text+'</p>'+
		'</li>';
	$('#messageChain').append(messageHTML);
}

