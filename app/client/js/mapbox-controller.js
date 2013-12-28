////////////////////////////////////////////////////////////////////////////////
/*
	mapbox-controller.js - Interfaces with MapBox
*/
////////////////////////////////////////////////////////////////////////////////

var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var geo = {};
var geoJson = [];
var bids = [];

$(document).ready(function() {
	if (!navigator.geolocation) {
		console.log('MAPBOX: geolocation is not available');
	} else if (geo.lat && geo.lng) {
		map.setView([lat, lng], 14);
	} else {
		map.locate();
	}
});

// Once we've got a position, zoom and center the map on it.
map.on('locationfound', function(e) {
	var lng = e.latlng.lng;
	var lat = e.latlng.lat;
	geo = {'lng' : lng, 'lat' : lat};
	map.setView([lat, lng], 14);
});

// If the user chooses not to allow their location to be shared, 
// display an error message.
map.on('locationerror', function() {
	console.log('MAPBOX: position could not be found');
});

// Set a custom icon on each marker based on feature properties
map.markerLayer.on('layeradd', function(e) {
	var marker = e.layer,
		feature = marker.feature;

	marker.setIcon(L.icon(feature.properties.icon));
});

function findMarker(bid) {
	for (var i = 0; i < bids.length; i++) {
		if (bids[i] == bid) {
			return i;
		}
	}
}

function createMarker(bid, lat, lng, title, comment, hostPic) {
	geoJson.push({
		'type': 'Feature',
		'geometry': {
			'type': 'Point',
			'coordinates': [lng, lat]
		},
		'properties': {
			'title': title,
			'description': comment,
			'icon': {
				'iconUrl': hostPic,
				'iconSize': [50, 50],
				'iconAnchor': [25, 25],
				'popupAnchor': [0, -25]
			}
		}
	});

	bids.push(bid);

	// Add features to the map
	map.markerLayer.setGeoJSON(geoJson);
}

function removeMarker(bid) {
	var index = findMarker(bid);
	geoJson.splice(index, 1);
	bids.splice(index, 1);
	map.markerLayer.setGeoJSON(geoJson);
}

