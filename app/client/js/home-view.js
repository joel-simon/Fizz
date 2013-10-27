////////////////////////////////////////////////////////////////////////////////
/*
	index-view.js - Draws objects on and Erases objects from the site
*/
////////////////////////////////////////////////////////////////////////////////

// Draws all necessary viewable parts of the given beacon.
function drawBeacon(beacon) {
	// console.log('Drawing:', beacon);
	// console.trace();
	// Place the beacon marker on the google map.
	setBeacon(beacon);

	// Put the beacon info into the beacon-list.
	createHtmlString(beacon, function(htmlString) {
		// console.log(htmlString);
		$('#beacon-list').prepend(htmlString);
		$('#host-'+beacon.host).on('click', function() {
			if ( beacon.host == me.id ) {
				disbandBeacon( beacon.host );
			} else if ( beacon.hasGuest(me.id) ) {
				leaveBeacon( beacon.host, me.id );
			} else {
				joinBeacon( beacon.host );
			}
		});
	});
}

// Helper function for drawBeacon.
function createHtmlString(beacon, callback) {
	var color, label;
	if ( beacon.host == me.id ) {
		color = 'btn-danger';
		label = 'Disband';
	} else if ( beacon.hasGuest(me.id) ) {
		color = 'btn-danger';
		label = 'Leave';
	} else {
		color = 'btn-primary';
		label = 'Join';
	}
	var htmlString = 
		'<li class="event">'+
			'<button class="btn '+color+' blarg" id="host-'+beacon.host+'">'+
				label+
			'</button>'+
			'<p class="details">'+beacon.desc+'</p>';

	var counter = 0;
	// Gets and displays the host info.
	getFbData(beacon.host, function(hostPic, hostName) {
		htmlString += '<img class="host-pic" title="'+hostName+'" src="'+hostPic+'">'+
			'<div class="attending"><div class="horizon">';

		if (beacon.attends.length) {
			// Loops through the guests and gets and displays their info.
			beacon.attends.forEach(function(guest, i) {
				getFbData(guest, function(guestPic, guestName) {
					htmlString += '<img class="guest-pic" title="'+guestName+'" src="'+guestPic+'">';
					if (++counter == beacon.attends.length) {
						htmlString += '</div></div></li>';
						callback(htmlString);
						return;
					}
				});
			});
		} else {
			htmlString += '</div></div></li>';
			callback(htmlString);
			return;
		}
	});
}


// Removes all visible traces of the beacon!
function eraseBeacon(beacon) {
	// Remove the beacon marker from the google map.
	if (beacon.marker) removeMarker(beacon.marker);

	// Remove the beacon from the beacon-list.
	$('#host-'+beacon.host).parent().remove();
}



// function writeBeaconEvent(beacon) {
// 	// var seen2 = {};
// 	console.log(beacon);
// 	// if(seen2[beacon.host]) return ;
// 	// seen2[beacon.host] = true;
// 	var htmlString = 
// 		'<li class="event">'+
// 			'<button class="btn btn-primary blarg" id="fb-'+beacon.host+'">Join</button>'+
// 			'<p class="details">'+beacon.desc+'</p>';

// 	var attending = beacon.attends;
// 	var dude;
// 	var c = 0;
// 	// console.log(beacon);

// 	getFbData(''+beacon.host, function(pic, name) {
// 		// console.log('host img', pic);

// 		htmlString += '<img class="host-pic" src="'+pic+'">'+
// 					'<div class="attending"><div class="horizon">';

// 		if (beacon.attends.length >= 1) {
// 			beacon.attends.forEach(function(dude, i) {
// 				getFbData(''+dude, function(pic, name) {
// 					console.log('here',dude, pic, name, i);
// 					htmlString += '<img class="guest-pic" src="'+pic+'">';

// 					if(i = beacon.attends.length){
// 						htmlString += '</div></div></li>';
// 						$('#beacon-list').append(htmlString);
// 					}
// 				});
// 			});
// 		} else {
// 			htmlString += '</div></div></li>';
// 			$('#beacon-list').append(htmlString);
// 		}
		
// 		$('button').on('click', function() {
// 			var host = this.id.substr(3, this.id.length);
// 			// console.log('join mudafuka!', host);
// 			socket.emit('joinBeacon', {'host': host, userId: me.id});
// 		});
// 	});

// }

