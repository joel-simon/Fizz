////////////////////////////////////////////////////////////////////////////////
/*
	mapbox-controller.js - Interfaces with MapBox
*/
////////////////////////////////////////////////////////////////////////////////

var map = L.mapbox.map('map', 'examples.map-9ijuk24y');
var OMM = new MarkerManager(map);

/*
	Geolocation
*/

function locateMe() {
	if (!navigator.geolocation) console.log('MAPBOX: geolocation is not available');
	else map.locate();
}

map.on('locationfound', function(e) {
	MIM.setLatLng(e.latlng);
});

map.on('locationerror', function() {
	console.log('MAPBOX: position could not be found');
});

/*
	Map Control
*/

var tempMarker;

map.on('click', function(e) {
	if (tempMarker) {
		tempMarker.setLatLng(e.latlng);
	} else {
		var myIcon = L.icon({
			iconUrl     : MIM.pic || '/img/userIcon.png',
			iconSize    : [50,50],
			iconAnchor  : [25, 25],
			className   : 'shadow-face-icon',
		});

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

function createIcon(pic) {
	return L.icon({
		iconUrl     : pic || '/img/userIcon.png',
		iconSize    : [50,50],
		iconAnchor  : [25, 25],
		className   : 'face-icon',
	});
}

function placeAllMarkers(event) {
	event.messageList.forEach(function(message, i) {
		mapMessage(message);
	});
}

function mapMessage(message) {
	if (message.marker) {
		OMM.newMarker(
			message.eid, 
			message.mid, 
			message.marker.latlng,
			createIcon(null),
			message.text,
			null,
		);
	}
	if (message.deletePastMarker) {
		OMM.deleteMarker(message.eid, message.mid);
	}
}

function deleteMarker(eid, mid) {
	OMM.deleteMarker(eid, mid);
}