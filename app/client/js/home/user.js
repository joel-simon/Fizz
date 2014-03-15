////////////////////////////////////////////////////////////////////////////////
/*
	User Object - contains and provides information about a Fizz User
*/
////////////////////////////////////////////////////////////////////////////////

function User(userData) {
	this.obj = userData;
	this.uid = userData.uid;
	this.type = userData.type;
	this.fbid = userData.fbid;
	this.name = userData.name;
	this.pic = '/img/userIcon.png';
}

User.prototype.isEqual = function(user) {
	if (this.uid === user.uid) return true;
	else return false;
}

User.prototype.getInfo = function(callback) {
	getFacebookInfo(this.fbid, function(name, pic) {
		this.name = name;
		this.pic = pic;
		if (callback) callback(name, pic);
	});
}

User.prototype.updateInfo = function(callback) {
	updateFacebookInfo(this.fbid, function(name, pic) {
		this.name = name;
		this.pic = pic;
		if (callback) callback(name, pic);
	});
}

User.prototype.updateUserData = function() {
	this.obj.name = this.name;
}