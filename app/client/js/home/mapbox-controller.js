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
	// map.setView(e.latlng, 14);
});

map.on('locationerror', function() {
	console.log('MAPBOX: position could not be found');
});

function getMyLocation() {
	return JSON.parse(localStorage.myLocation);
}

/*
	Map Control
*/

var tempMarker;

function getTempMarker() {
	if (tempMarker) {
		var latlng = tempMarker._latlng;
		var name = '';
		var time = Date.now();
		return {latlng:latlng, name:name, time:time};
	} else {
		return null;
	}
}

function removeTempMarker() {
	if (tempMarker) {
		map.removeLayer(tempMarker);
		tempMarker = null;
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
		$('.marker-indicator').removeClass('hidden');

		tempMarker.on('click', function() {
			removeTempMarker();
			$('.marker-indicator').addClass('hidden');
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


/*
	Search Markers
*/

// put functions here


/*
	Event Markers
*/

function placeAllMarkers(event) {
	event.messageList.forEach(function(message, i) {
		var user = event.getUser(message.uid);
		getFacebookInfo(user.fbid, function(name, pic) {
			mapMessage(message, pic);
		});
	});
}

function mapMessage(message, pic) {
	if (message.marker) {
		OMM.newMarker(
			message.eid, 
			message.mid, 
			message.marker.latlng,
			createIcon(pic),
			message.marker.name,
			{ text : message.text }
		);
	}
}

function deleteMarker(eid, mid) {
	OMM.deleteMarker(eid, mid);
}