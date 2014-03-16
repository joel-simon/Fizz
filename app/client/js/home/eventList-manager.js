////////////////////////////////////////////////////////////////////////////////
/*
	EventListManager - manages all the events
*/
////////////////////////////////////////////////////////////////////////////////

var ELM = new EventListManager();

function EventListManager() {
	this.table = {};
	this.count = 0;
}

EventListManager.prototype.addEvent = function(event) {
	var event = new Event(event);
	this.table[event.eid] = event;
	this.count++;
	DM.drawThread(event);
}

EventListManager.prototype.getEvent = function(eid) {
	return this.table[eid];
}

EventListManager.prototype.deleteEvent = function(eid) {
	delete this.table[eid];
	this.count--;
}