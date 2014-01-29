////////////////////////////////////////////////////////////////////////////////
/*
	MyInfoManager - manages functionality for my information
*/
////////////////////////////////////////////////////////////////////////////////

var MIM = new MyInfoManager();

function MyInfoManager() {
	// start off with facebook info
	this.fbid = sessionStorage.fbid;
	getFacebookInfo(this.fbid, function(name, pic) {
		this.name = name;
		this.pic  = pic;
		drawUser(this.name, this.pic);
	});
	// then do mapbox info
	this.latlng = JSON.parse(localStorage.getItem('myLocation')) || {};
}

MyInfoManager.prototype.updateUserInfo = function(user) {
	this.uid    = user.uid;
	this.pn     = user.pn;
	this.hasApp = user.hasApp;
}

MyInfoManager.prototype.updateFriendList = function(friendList) {
	this.friendList = friendList;
}

MyInfoManager.prototype.toUserObject = function() {
	return {
		uid    : this.uid,
		fbid   : this.fbid,
		pn     : this.pn,
		name   : this.name,
		hasApp : this.hasApp,
	};
}

MyInfoManager.prototype.setLatLng = function(latlng) {
	this.latlng = latlng;
	localStorage.setItem( 'myLocation', JSON.stringify(latlng) );
}