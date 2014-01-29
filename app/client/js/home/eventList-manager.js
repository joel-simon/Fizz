////////////////////////////////////////////////////////////////////////////////
/*
	EventListManager - manages functionality for all the events
*/
////////////////////////////////////////////////////////////////////////////////

var ELM = new EventListManager();

function EventListManager() {
	this.table = {};
	this.count = 0;
}

EventListManager.prototype.newEvent = function(event) {
	var event = new Event(event);
	drawEvent(event);
	this.table[event.eid] = event;
	this.count++;
}

EventListManager.prototype.getEvent = function(eid) {
	return this.table[eid];
}

EventListManager.prototype.deleteEvent = function(eid) {
	eraseEvent(this.table[eid]);
	delete this.table[eid];
	this.count--;
}