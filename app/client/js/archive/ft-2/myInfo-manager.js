////////////////////////////////////////////////////////////////////////////////
/*
	MyInfoManager - manages functionality for my information
*/
////////////////////////////////////////////////////////////////////////////////

var MIM;

function MyInfoManager(user) {
	// start off with facebook info
	this.uid    = user.uid;
	this.pn     = user.pn;
	this.hasApp = user.hasApp;
	this.fbid   = user.fbid;
	getFacebookInfo(this.fbid, function(name, pic) {
		this.name = name;
		this.pic  = pic;
		drawUser(this.name, this.pic);
	});
}

MyInfoManager.prototype.pic = function() {
	return pic;
}

MyInfoManager.prototype.updateFriendList = function(friendList) {
	this.friendList = friendList;
}

MyInfoManager.prototype.updateInviteList = function(inviteList) {
	this.inviteList = inviteList;
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