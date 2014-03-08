////////////////////////////////////////////////////////////////////////////////
/*
	timeline-html.js - creates HTML strings for views
*/
////////////////////////////////////////////////////////////////////////////////

var timelineList = [];

function addEventToTimeline(event, callback) {
	var lastMessage = event.messageList[event.messageList.length - 1];
	var time = lastMessage.creationTime;
	var index = 0;
	for (var i = 0; i < timelineList.length; i++) {
		if (timelineList[i] >= time) {
			index = i;
			timelineList.splice(i, 0, time);
		} else if (i+1 === timelineList.length) {
			index = -1;
		}
	}

	var eventHTML = '<li class="event" id="event-'+event.eid+'">';
	eventHTML += '<h2 class="eventMessage">'+event.messageList[0].text+'</h2>';
	var count = 0;
	event.inviteList.forEach(function(user, i) {
		getFacebookInfo(user.fbid, function(name, pic) {
			eventHTML += '<img class="hidden pic user'+i+'" title="'+
				name+'" src="'+pic+'">';
			if (++count === event.inviteList.length) {
				eventHTML += '</li>';
				callback(eventHTML, index);
			}
		});
	});
}