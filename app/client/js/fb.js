var me = {};
var fbInfo = {};

$(document).ready(function() {
	me.id = $.cookie('userId');
	me.name = $.cookie('userName');
	me.pic = $.cookie('userPicture');

	if (me.name && me.pic) {
		fbInfo[me.id] = {'name':me.name, 'pic':me.pic};
		console.log('Received FB info from cookies:', fbInfo);
		drawUserInfo(me.pic, me.name);
	} else {
		console.log('Getting info from FB...');
		getFbData(me.id, function(pic, name) {
			drawUserInfo(pic, name);
			$.cookie('userName', name, { expires: 7 });
			$.cookie('userPicture', pic, { expires: 7 });
		});
	}
});

function getFbData(id, callback) {
	$.ajax({
		url: 'http://graph.facebook.com/'+id+'?fields=picture,name',
		success: function( data ) {
			var pic  = data.picture.data.url;
			var name = data.name;
			fbInfo[id] = {'name':name, 'pic':pic};
			callback(pic, name);
		}
	});
}