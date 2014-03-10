////////////////////////////////////////////////////////////////////////////////
/*
	MarkerManager - manages functionality for a map's markers
*/
////////////////////////////////////////////////////////////////////////////////

function MarkerManager(map) {
	this.map   = map;
	this.table = {};
	this.count = 0;
	
	this.markerCluster = new L.markerClusterGroup();
	this.map.addLayer(this.markerCluster);
}

/*
	People Markers
*/

MarkerManager.prototype.newMarker = function(eid, mid, latlng, icon, name, data) {
	popupHTML =
		'<div class="marker-'+eid+'">'+
			'<h3 class="no-margin">'+name+'</h3>'+
			'<p class="no-margin">'+data.text+'</p>'+
		'</div>';
	var marker = L.marker(latlng, {
		icon  : icon,
		title : name,
		riseOnHover : true,
		eid   : eid,
		mid   : mid,
		data  : data,
	});
	this.table[eid+'-'+mid] = marker;
	this.count++;
	marker.addTo(this.map).bindPopup(popupHTML, {
		'closeButton' : false,
		'offset' : new L.Point(0, -12),
	});
	marker.on('mouseover', function() {
		marker.openPopup();
	});
	marker.on('mouseout', function() {
		marker.closePopup();
	});
	marker.on('click', function() {
		if (detail == -1) {
			// console.log('DETAIL VIEW '+eid);
			createDetailView( ELM.getEvent(eid) );
			detail = eid;
		}
	});
}

MarkerManager.prototype.deleteMarker = function(eid, mid) {
	var marker = this.table[eid+'-'+mid];
	this.map.removeLayer(marker);
	delete this.table[eid+'-'+mid];
	this.count--;
}

MarkerManager.prototype.clearMap = function() {
	var marker;
	for (var markID in this.table) {
		marker = this.table[markID];
		this.deleteMarker(marker.options.eid, marker.options.mid);
	}
}

MarkerManager.prototype.fitMarkersToScreen = function() {
	var latlngArray = [];
	var c = 0;
	var marker;
	for (var markID in this.table) {
		marker = this.table[markID];
		latlngArray.push(marker.getLatLng());
		if (++c == this.count) {
			map.fitBounds(latlngArray, {padding : [50,50]} );
			if (latlngArray.length == 1) {
				var latlng = latlngArray[0];
				map.setView(latlng, 17);
			}
		}
	}

}


/*
	Search Markers
*/

MarkerManager.prototype.clearSearchMarkerCluster = function() {
	this.markerCluster.clearLayers();
}

MarkerManager.prototype.newSearchMarker = function(latlng, name, data) {
	var icon = L.icon({
		iconUrl    : 'http://www.clker.com/cliparts/I/l/L/S/W/9/map-marker-hi.png',
		iconSize   : [20,30],
	})

	var marker = L.marker(latlng, {
		icon  : icon,
		title : name,
		riseOnHover : true,
		data  : data,
	});
	marker.bindPopup(name, {
		'closeButton' : false,
		'offset' : new L.Point(0, 0),
	});
	this.markerCluster.addLayer(marker);
}