////////////////////////////////////////////////////////////////////////////////
/*
	mapbox-controller.js - Interfaces with MapBox
*/
////////////////////////////////////////////////////////////////////////////////

var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var me.latlng = JSON.parse(localStorage.getItem('location')) || {};
var markers = {};
var tempMarker;

var myIcon;


$(document).ready(function() {
	if (!navigator.geolocation) {
		console.log('MAPBOX: geolocation is not available');
	} else if (geo.lat && geo.lng) {
		map.setView([geo.lat, geo.lng], 14);
		map.locate();
	} else {
		map.locate();
	}

	myIcon = L.icon({
		iconUrl     : me.pic || '/img/userIcon.png',
		iconSize    : [50,50],
		iconAnchor  : [25, 25],
		// popupAnchor : [0, -25],
		className   : 'shadow-face-icon',
	});
});

// Once we've got a position, zoom and center the map on it.
map.on('locationfound', function(e) {
	var lng = e.latlng.lng;
	var lat = e.latlng.lat;
	localStorage.setItem('location', JSON.stringify({'lat':lat, 'lng':lng}));
	geo = {'lat' : lat, 'lng' : lng};
	map.setView([lat, lng], 14);
	tempMarker = L.marker(e.latlng, {
		icon        : myIcon,
		draggable   : true,
	});
	tempMarker.addTo(map);
});

// If the user chooses not to allow their location to be shared, 
// display an error message.
map.on('locationerror', function() {
	console.log('MAPBOX: position could not be found');
});

function centerMap(lat, lng) {
	map.setView([lat, lng]);
}

map.on('click', function(e) {
	// console.log(e.latlng);
	if (tempMarker) {
		tempMarker.setLatLng(e.latlng);
	} else {
		tempMarker = L.marker(e.latlng, {
			icon        : myIcon,
			draggable   : true,
		});
		tempMarker.addTo(map);
		tempMarker.on('click', function() {
			map.removeLayer(tempMarker);
			tempMarker = null;
		});
	}
});

function createMarker(bid, lat, lng, title, comment, hostPic) {
	var icon = L.icon({
		iconUrl     : hostPic,
		iconSize    : [50,50],
		iconAnchor  : [25, 25],
		// popupAnchor : [0, -25],
		className   : 'face-icon',
	});
	var marker = L.marker([lat, lng], {
		icon        : icon,
		// draggable   : true,
		title       : title,
		description : comment,
	});

	markers[bid] = marker;

	marker.on('click', function(e) {
		console.log("I'm a marker!");
	});

	marker.addTo(map);
}

function removeMarker(bid) {
	var index = findMarker(bid);
	geoJson.splice(index, 1);
	bids.splice(index, 1);
	map.markerLayer.setGeoJSON(geoJson);
}

