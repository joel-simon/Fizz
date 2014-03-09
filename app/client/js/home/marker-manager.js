////////////////////////////////////////////////////////////////////////////////
/*
	MarkerManager - manages functionality for a map's markers
*/
////////////////////////////////////////////////////////////////////////////////

function MarkerManager(map) {
	this.map   = map;
	this.table = {};
	this.count = 0;
	this.searchMarkerArray = [];
}

/*
	People Markers
*/

MarkerManager.prototype.newMarker = function(eid, mid, latlng, icon, name, data) {
	var marker = L.marker(latlng, {
		icon  : icon,
		title : name,
		riseOnHover : true,
		data  : data,
	});
	this.table[eid+'-'+mid] = marker;
	this.count++;
	marker.addTo(this.map).bindPopup(name, {
		'closeButton' : false,
		'offset' : new L.Point(0, -12),
	});
}

MarkerManager.prototype.deleteMarker = function(eid, mid) {
	var marker = this.table[eid+'-'+mid];
	this.map.removeLayer(marker);
	delete this.table[eid+'-'+mid];
	this.count--;
}

/*
	Search Markers
*/

MarkerManager.prototype.clearSearchMarkerArray = function() {
	var count = 0;
	this.searchMarkerArray.forEach(function(marker, i) {
		this.map.removeLayer(marker);
		if (++count == this.searchMarkerArray.length)
			this.searchMarkerArray = [];
	});
}

MarkerManager.prototype.newSearchMarker = function(latlng, name, data) {
	var marker = L.marker(latlng, {
		icon  : createIcon('http://www.clker.com/cliparts/r/e/O/A/A/0/orange-map-marker-no-shadow-hi.png', 'searchMarker'),
		title : name,
		riseOnHover : true,
		data  : data,
	});
	this.searchMarkerArray.push(marker);
	marker.addTo(this.map).bindPopup(name, {
		'closeButton' : false,
		'offset' : new L.Point(0, -12),
	});
}