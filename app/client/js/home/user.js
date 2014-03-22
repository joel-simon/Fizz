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
	var self = this;
	getFacebookInfo(this.fbid, function(name, pic) {
		self.name = name;
		self.pic = pic;
		if (callback) callback(name, pic);
	});
}

User.prototype.updateInfo = function(callback) {
	var self = this;
	updateFacebookInfo(this.fbid, function(name, pic) {
		self.name = name;
		self.pic = pic;
		self.updateUserData();
		if (callback) callback(name, pic);
	});
}

User.prototype.updateUserData = function() {
	this.obj.name = this.name;
}