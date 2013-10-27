////////////////////////////////////////////////////////////////////////////////
/*
	index-controller.js
*/
////////////////////////////////////////////////////////////////////////////////

function writeBeaconEvent(beacon) {
	var htmlString = 
		'<li class="event">'+
			'<button class="btn btn-primary">Join</button>'+
			'<p class="details">'+beacon.desc+'</p>';

	var attending = beacon.attends;
	var dude;
	var c = 0;
	// console.log(beacon);

	getFbData(''+beacon.attends[0], function(pic, name) {
		console.log('host img', pic);
		htmlString += '<img class="host-pic" src="'+pic+'">'+
					'<div class="attending"><div class="horizon">';
		var i = 1;
		while (i < beacon.attends.length) {
			dude = beacon.attends[i];
			getFbData(''+dude, function(pic, name) {
				htmlString += '<img class="guest-pic" src="'+pic+'">';
				i++;
			});
			
		}
		$('#beacon-list').append(htmlString);
		
	});

}
