////////////////////////////////////////////////////////////////////////////////
/*
	Event Object - provides all available Event information
*/
////////////////////////////////////////////////////////////////////////////////

function Event(event) {
	this.eid = event.eid;
	this.creator = event.creator;
	this.guestList = event.guestList;
	this.inviteList = new UserListManager(event.inviteList);
	this.seats = event.seats;
	this.messageList = event.messageList;
	this.inviteOnly = event.inviteOnly;

	this.mostRecent = this.getMostRecent();
}

Event.prototype.getUser = function(uid) {
	return this.inviteList.getUser(uid);
}

Event.prototype.isInvited = function(uid) {
	return this.inviteList.hasUser(uid);
}

Event.prototype.addInvite = function(userData) {
	this.inviteList.addUser(userData);
}

Event.prototype.isGuest = function(uid) {
	for (var i = 0; i < this.guestList.length; i++) {
		if (this.guestList[i] === uid) return true;
	}
	return false;
}

Event.prototype.addGuest = function(uid) {
	this.guestList.push(uid);
}

Event.prototype.removeGuest = function(uid) {
	for (var i = 0; i < this.guestList.length; i++) {
		if (this.guestList[i] === uid) {
			this.guestList.splice(i,1);
		}
	}
}

Event.prototype.setSeats = function(seats) {
	this.seats = seats;
}

Event.prototype.getMostRecent = function() {
	var lastMessage = this.messageList[this.messageList.length - 1];
	return lastMessage.creationTime;
}

Event.prototype.addMessage = function(message) {
	this.messageList.push(message);
	this.mostRecent = message.creationTime;
	DM.drawMessage(message);
}