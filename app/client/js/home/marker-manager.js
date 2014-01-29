////////////////////////////////////////////////////////////////////////////////
/*
	MarkerManager - manages functionality for a map's markers
*/
////////////////////////////////////////////////////////////////////////////////

function MarkerManager(map) {
	this.map   = map;
	this.table = {};
	this.count = 0;
}

MarkerManager.prototype.newMarker = function(eid, mid, latlng, icon, name, data) {
	var marker = L.marker(latlng, {
		icon  : icon,
		title : name,
		data  : data,
	});
	this.table[eid+'-'+mid] = marker;
	this.count++;
	marker.addTo(this.map);
}

MarkerManager.prototype.deleteMarker = function(eid, mid) {
	var marker = this.table[eid+'-'+mid];
	this.map.removeLayer(marker);
	delete this.table[eid+'-'+mid];
	this.count--;
}