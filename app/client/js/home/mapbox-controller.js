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
	else {
		map.locate();
		if (localStorage.myLocation) {
			map.setView( JSON.parse(localStorage.myLocation), 14 );
		}
	}
}

map.on('locationfound', function(e) {
	console.log('MAPBOX: location found!', e.latlng);
	localStorage.myLocation = JSON.stringify(e.latlng);
	map.setView(e.latlng, 14);
});

map.on('locationerror', function() {
	console.log('MAPBOX: position could not be found');
});

/*
	Map Control
*/

var tempMarker;

function getTempMarker() {
	if (tempMarker) {
		var latlng = tempMarker._latlng;
		var name = 'marker';
		var time = Date.now();
		return {latlng:latlng, name:name, time:time};
	} else {
		return null;
	}
}

map.on('click', function(e) {
	if (tempMarker) {
		tempMarker.setLatLng(e.latlng);
	} else {
		tempMarker = L.marker(e.latlng, {
			icon        : createIcon(MIM.pic(), true),
			draggable   : true,
		});

		tempMarker.addTo(map);

		tempMarker.on('click', function() {
			map.removeLayer(tempMarker);
			tempMarker = null;
		});
	}
});

function createIcon(pic, temp) {
	var className = temp ? 'shadow-face-icon' : 'face-icon';
	return L.icon({
		iconUrl     : pic || '/img/userIcon.png',
		iconSize    : [50,50],
		iconAnchor  : [25,25],
		className   : className,
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
			null
		);
	}
	if (message.deletePastMarker) {
		OMM.deleteMarker(message.eid, message.mid);
	}
}

function deleteMarker(eid, mid) {
	OMM.deleteMarker(eid, mid);
}