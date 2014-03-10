////////////////////////////////////////////////////////////////////////////////
/*
	Event Class - provides all available Event information
*/
////////////////////////////////////////////////////////////////////////////////

function Event(event) {
	for (var prop in event) {
		this[prop] = event[prop];
	}
}

Event.prototype.findUserIndex = function(uid, userList) {
	for (var i = 0; i < userList.length; i++) {
		if ( userList[i].uid === uid ) return i;
	}
	return -1;
}

Event.prototype.getUser = function(uid) {
	return this.inviteList[ this.findUserIndex(uid, this.inviteList) ];
}

Event.prototype.addGuest = function(uid) {
	this.guestList.push(uid);
	// drawGuest(eid, getUser(uid));
}

Event.prototype.removeGuest = function(uid) {
	for (var i = 0; i < this.guestList.length; i++) {
		if ( this.guestList[i] === uid ) {
			this.guestList.splice(i, 1);
		}
	}
}

Event.prototype.hasGuest = function(uid) {
	for (var i = 0; i < this.guestList.length; i++) {
		if ( this.guestList[i] === uid ) return true;
	}
	return false;
}

Event.prototype.hasInvite = function(uid) {
	if ( this.findUserIndex(uid, this.inviteList) !== -1 ) return true;
	else return false;
}

Event.prototype.addMessage = function(message) {
	this.messageList.push(message);
	var user = this.getUser(message.uid);
	getFacebookInfo(user.fbid, function(name, pic) {
		drawMessage(message, name, pic);
	});
}