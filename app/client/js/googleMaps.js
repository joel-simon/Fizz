///////////////////////////////////////////////////////////////////////////////
/*
	Google Maps Interface - This is the code interacting with Google Maps API
		and Google Places API.

	Helper Functions for quick interation begin at LINE 146.
*/
////////////////////////////////////////////////////////////////////////////////


var autocomplete, map, currentPosition, tempMarker;

function initialize() {
	var mapOptions = {
		zoom: 16,
		center: new google.maps.LatLng(40.4433, -79.9436),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);


	// Google Places stuff
	var input = document.getElementById('searchTextField');
	autocomplete = new google.maps.places.Autocomplete(input);

	autocomplete.bindTo('bounds', map);

	var infowindow = new google.maps.InfoWindow();
	var marker = new google.maps.Marker({
		map: map
	});

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		input.className = '';
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			// Inform the user that the place was not found and return.
			input.className = 'notfound';
			return;
		}

		// If the place has a geometry, then present it on a map.
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(16);
		}
		marker.setIcon({
			url: place.icon,
			size: new google.maps.Size(71,71),
			origin: new google.maps.Point(0,0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35),
		});
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);

		var address = '';
		if (place.address_components) {
			adress = [
				(place.address_components[0] && place.address_components[0].short_name || ''),
				(place.address_components[1] && place.address_components[1].short_name || ''),
				(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
		infowindow.open(map, marker);
		tempMarker = marker;
	});

	// Clicking on the map
	google.maps.event.addListener(map, 'click', function(e) {
		// console.log('map clicked', e.latLng);
		placeTempMarker(e.latLng, map);
	});

	// HTML5 geolocation
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude, 
				position.coords.longitude);

			currentPosition = pos;
			map.setCenter(pos);

		}, function() {
			handleNoGeolocation(true);
		});
	} else {
		// Browser doesn't support Geolocation
		handleNoGeolocation(false);
	}
}


function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}

	var options = {
		map: map,
		position: new google.maps.LatLng(60, 105),
		content: content
	};

	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}


// // Google Places stuff. Probably should delete this later.
// function setupClickListener(id, types) {
// 	var radioButton = document.getElementById(id);
// 	google.maps.event.addDomListener(radioButton, 'click', function() {
// 		autocomplete.setTypes(types);
// 	});
// }

// setupClickListener('changetype-all', []);
// setupClickListener('changetype-establishment', ['establishment']);
// setupClickListener('changetype-geocode', ['geocode']);


// intitiallize the google map once the window loads
google.maps.event.addDomListener(window, 'load', initialize);


// To place a temporary marker on the map in the event of a click.
function placeTempMarker(position, map) {
	if (tempMarker) tempMarker.setMap(null);
	tempMarker = new google.maps.Marker({
		position: position,
		map: map
	});
}

////////////////////////////////////////////////////////////////////////////////
/*
	My helper functions for interacting with google maps api
*/
////////////////////////////////////////////////////////////////////////////////

/** 
 * Creates a Google Maps marker for the Beacon based on its latitude and 
 * longitude, and puts it on the map.
 * @param {int} lat - The latitude of the Beacon.
 * @param {int} lng - The longitude of the Beacon.
 */
function createMarker(lat, lng) {
	if (lat && lng)
		var pos = new google.maps.LatLng(lat, lng);
	if (tempMarker) tempMarker.setMap(null);
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
	});
	return marker;
}

/** 
 * Creates a Google Maps marker for the Beacon based on its latitude and 
 * longitude, and puts it on the map.
 * @param {int} lat - The latitude of the Beacon.
 * @param {int} lng - The longitude of the Beacon.
 */
function setMarkerInfo(marker, title, desc) {
	// set the marker's title and content
	marker.setTitle(title);
	var infowindow = new google.maps.InfoWindow({
		content: desc
	});
	// open the infowindow as the default
	infowindow.open(marker.get('map'), marker);

	// add a listener for the marker to open the infowindow on click
	google.maps.event.addListener(marker, 'click', function(e) {
		infowindow.open(marker.get('map'), marker);
	});
}

/** 
 * Removes a marker from the map.
 * @param {object} marker - The Google Maps marker correlating to a Beacon.
 */
function removeMarker(marker) {
	marker.setMap(null);
}

/** 
 * Centers the User's Map around a specific Beacon's marker
 * @param {object} marker - The Google Maps marker correlating to a Beacon.
 */
function centerMap(marker) {
	map.panTo(marker.position);
}

/** 
 * Centers the User's Map to the location of the User's device.
 */
function centerMapHere() {
	map.panTo(currentPosition);
}

/** 
 * Transfers the Beacon's data over to Google Maps so it can be properly
 * displayed on the map with all the relevant info.
 * @param {object} beacon - see client-beacon.js
 */
function setBeacon(beacon) {
	//lat, lng, title, desc
	if (beacon.marker) removeMarker(beacon.marker);
	beacon.marker = createMarker(beacon.lat, beacon.lng);
	
	setMarkerInfo(beacon.marker, beacon.title, beacon.desc);
}




