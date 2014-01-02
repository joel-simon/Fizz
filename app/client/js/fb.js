var me = {};
var friends = {};
if (!localStorage.fbInfo) localStorage.fbInfo = {};
$(document).ready(function() {
	myId = $.cookie('userId');
	getFbData(myId, function(pic, name) {
		me.pic 	= pic;
		me.name = name;
		me.id 	= myId;
		console.log(me);
		drawUserInfo(pic, name);
	});
});

function getFbData(id, callback) {
	id = ''+id; 
	var store = localStorage;
	var user = localStorage.getItem(id);
	if (user) {
		user = JSON.parse(user);
		callback(user.pic, user.name);
	} else {
		$.ajax({
			url: 'http://graph.facebook.com/'+id+'?fields=picture,name',
			success: function( data ) {
				var pic  = data.picture.data.url;
				var name = data.name;
				localStorage.setItem(id, JSON.stringify({'name':name, 'pic':pic}));
				callback(pic, name);
			}
		});
	}
}