var me = {};
me.id = $.cookie('userId');
me.name = $.cookie('userName');
me.picture = $.cookie('userPicture');

if (me.name && me.picture) {
	console.log('got from cookies');
	drawUserInfo(me.picture, me.name);
} else {
	console.log('got from fb');
	getFbData(me.id, function(hostPic, hostName) {
		drawUserInfo(hostPic, hostName);
		$.cookie('userName', hostName, { expires: 7 });
		$.cookie('userPicture', hostPic, { expires: 7 });
	});
}

function getFbData(id, callback) {
	$.ajax({
	  url: 'http://graph.facebook.com/'+id+'?fields=picture,name',
	  success: function( data ) {
	  	callback(data.picture.data.url, data.name);
	      // console.log( "Sample of data:", data );
	  }
});

}