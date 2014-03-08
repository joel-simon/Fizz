////////////////////////////////////////////////////////////////////////////////
/*
	timeline-html.js - creates HTML strings for views
*/
////////////////////////////////////////////////////////////////////////////////

var timelineList = [];
var eidList = [];

function addEventToTimeline(event, callback) {
	var lastMessage = event.messageList[event.messageList.length - 1];
	var time = lastMessage.creationTime;
	var index = getSortedIndex(timelineList, time);
	timelineList.splice(index+1, 0, time);
	eidList.splice(index+1, 0, event.eid);
	// console.log(time, timelineList, eidList);

	var eventHTML = '<li class="event" id="timeline-'+event.eid+'">';
	eventHTML += '<h2 class="eventMessage">'+event.messageList[0].text+'</h2>';
	var count = 0;
	event.inviteList.forEach(function(user, i) {
		getFacebookInfo(user.fbid, function(name, pic) {
			eventHTML += '<img class="invitePic pic user'+i+'" title="'+
				name+'" src="'+pic+'">';
			if (++count === event.inviteList.length) {
				eventHTML += '</li>';
				callback(eventHTML, index);
			}
		});
	});
}

function getSortedIndex(array, elt) {
	for (var i = array.length - 1; i >= 0; i--) {
		if (elt <= array[i]) {
			return i;
		}
	}
	return -1;
}