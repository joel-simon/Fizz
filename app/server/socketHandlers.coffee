module.exports =
	connect : require './socketHandlers/connect.js'
	getMoreMessages : new (require './socketHandlers/GetMoreMessages')
	joinEvent : require './socketHandlers/joinEvent'
	leaveEvent : require './socketHandlers/leaveEvent'
	locationChange : require './socketHandlers/locationChange'
	newEvent : require './socketHandlers/newEvent'
	newInvites : require './socketHandlers/newInvites'
	newMarker : require './socketHandlers/newMarker'
	newMessage : require './socketHandlers/newMessage'
	onAuth : require './socketHandlers/onAuth'