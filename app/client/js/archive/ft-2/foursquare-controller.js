////////////////////////////////////////////////////////////////////////////////
/*
	foursquare-controller.js - Interfaces with Foursquare
*/
////////////////////////////////////////////////////////////////////////////////

function queryFoursquare(query) {
	OMM.clearSearchMarkerCluster();

	var bounds = map.getBounds();
	var ne = bounds._northEast;
	var sw = bounds._southWest;
	var token = '1JB3POF44JPEC5FDIENCBZRSIUD3SM0YUS5CTV3E2245LNHW';
	var url = 'https://api.foursquare.com/v2/venues/explore?'+
						'&sw='+sw.lat+','+sw.lng+
						'&ne='+ne.lat+','+ne.lng+
						'&query='+query+
						'&oauth_token='+token+'&v=20120101'+
						'&limit=999'+
						'&intent=browse'+
						'&callback=?';

	loadMarkers(url);
}
function loadMarkers(url) {
	$.ajax({
		cache: true,
		url: url,
		dataType: 'json',
		success: function(data) {
			if (data.response.groups) {
				venues = data.response.groups[0].items;
				console.log('Found %d venues.', venues.length);
				for (var i = 0; i < venues.length; i++) {
					OMM.newSearchMarker(venues[i].venue.location, venues[i].venue.name);
				}
			} else {
				alert('No matches found nearby.')
			}
			
		},
		complete: function(){
			// $('.loading').fadeOut().remove();
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
		}
	});
}