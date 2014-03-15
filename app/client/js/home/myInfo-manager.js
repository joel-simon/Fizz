////////////////////////////////////////////////////////////////////////////////
/*
	MyInfo Manager - manages my information
*/
////////////////////////////////////////////////////////////////////////////////

var MIM;

function MyInfoManager(userData) {
	this.me = new User(userData);
	this.me.getInfo();
	this.friends = null;
}

MyInfoManager.prototype.setFriendList = function(friendList) {
	this.friends = new UserListManager(friendList);
}