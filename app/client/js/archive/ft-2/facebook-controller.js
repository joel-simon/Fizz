////////////////////////////////////////////////////////////////////////////////
/*
	facebook-controller.js - Interfaces with Facebook
*/
////////////////////////////////////////////////////////////////////////////////

function getFacebookInfo(fbid, callback) {
	var infoString = localStorage[fbid];
	if (infoString) {
		info = JSON.parse(infoString);
		callback(info.name, info.pic);
	} else {
		$.ajax({
			url: 'http://graph.facebook.com/'+fbid+'?fields=picture,name',
			success: function(data) {
				var name = data.name;
				var pic  = data.picture.data.url;
				localStorage[fbid] = JSON.stringify({ name:name, pic:pic });
				callback(name, pic);
			}
		});
	}
}