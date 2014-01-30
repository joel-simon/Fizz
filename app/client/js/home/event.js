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

function findUserIndex(uid, userList) {
	for (var i = 0; i < userList.length; i++) {
		if ( userList[i].uid === uid ) return i;
	}
	return -1;
}

function getUser(uid) {
	return this.inviteList[ findUserIndex(uid, this.inviteList) ];
}

Event.prototype.addGuest = function(uid) {
	this.guestList.push(uid);
	drawGuest(eid, getUser(uid));
}

Event.prototype.removeGuest = function(uid) {
	var index = findUserIndex(uid, this.guestList);
	if ( index !== -1 ) {
		this.guestList.splice(index, 1);
		eraseGuest(eid, uid);
	}
}

Event.prototype.hasGuest = function(uid) {
	if ( findUserIndex(uid, this.guestList) !== -1 ) return true;
	else return false;
}

Event.prototype.hasInvite = function(uid) {
	if ( findUserIndex(uid, this.inviteList) !== -1 ) return true;
	else return false;
}

Event.prototype.addMessage = function(message) {
	this.messageList.push(message);
	drawMessage(message);
}