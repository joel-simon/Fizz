////////////////////////////////////////////////////////////////////////////////
/*
	view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

// Place User's name and pic
function drawUser(name, pic) {
	$('#host-name').html(name);
	$('#host-pic').attr('src', pic);
}

// Draws all necessary viewable parts of the given beacon.
function drawEvent(event) {
	// Mapbox interaction
	placeAllMarkers(event);

	// Put information into the Timeline's Event List
	var length = $('#event-list').children().length;
	addEventToTimeline(event, function(eventHTML, index) {
		if (index == -1) {
			$('#event-list').prepend(eventHTML);
			$('#timeline-'+event.eid).on('click', function() {
				if (detail == -1) {
					createDetailView( ELM.getEvent(event.eid) );
					detail = event.eid;
				}
			});
		} else {
			$('#timeline-'+eidList[index]).after(eventHTML);
			$('#timeline-'+event.eid).on('click', function() {
				if (detail == -1) {
					createDetailView( ELM.getEvent(event.eid) );
					detail = event.eid;
				}
			});
		}
		event.inviteList.forEach(function(user, i) {
			var width = Math.random()*( $(window).width() - 70 );
			var height = Math.random()*( 300 - 50 );
			// console.log( width, height );
			$('#timeline-'+event.eid+' .user'+i).css({
				top  : height+'px',
				left : width+'px',
			});
		});
	});
}

var inviteList = [];

function setUpInviteManager(friendList) {
	var string;
	friendList.forEach(function(friend, i) {
		getFacebookInfo(friend.fbid, function(name, pic) {
			string = 
				'<li class="friend" id="friend-'+friend.uid+'">'+
					'<img src="'+pic+'" class="pic" title="'+name+'">'+
					'<p>'+name+'</p>'+
				'</li>';
			$('#friendList').append(string);
			// console.log( $('#friend-'+friend.uid)[0] );
			$('#friend-'+friend.uid).on('click', function() {
				if ( $(this).parent()[0].id == 'friendList' ) {
					$('#inviteList').append( $(this) );
					inviteList.push(friend);
				} else {
					$('#friendList').append( $(this) );
					for (var i = inviteList.length - 1; i >= 0; i--) {
						if (inviteList[i].uid === friend.uid) {
							inviteList.splice(i, 1);
						}
					}
				}
			});
		});
	});
}
