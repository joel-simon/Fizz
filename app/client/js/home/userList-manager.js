////////////////////////////////////////////////////////////////////////////////
/*
	UserList Manager - manages a group of Users
*/
////////////////////////////////////////////////////////////////////////////////

function UserListManager(userList) {
	this.table = {};
	this.count = 0;

	var self = this;
	userList.forEach(function(userData, i) {
		self.addUser(userData);
	});
}

UserListManager.prototype.getUser = function(uid) {
	return this.table[uid];
}

UserListManager.prototype.hasUser = function(uid) {
	if (this.table[uid]) return true;
	else return false;
}

UserListManager.prototype.addUser = function(userData) {
	this.table[userData.uid] = new User(userData);
	this.count++;
}

UserListManager.prototype.deleteUser = function(uid) {
	delete this.table[uid];
	this.count--;
}