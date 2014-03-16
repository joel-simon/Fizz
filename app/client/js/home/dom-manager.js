////////////////////////////////////////////////////////////////////////////////
/*
	DOM Manager - Interfaces with the DOM
*/
////////////////////////////////////////////////////////////////////////////////

var DM = new DomManager();

function DomManager() {
	this.threadList = [];
}

DomManager.prototype.getThread = function(eid) {
	for (var i = 0; i < this.threadList.length; i++) {
		if (this.threadList[i].eid === eid) return i;
	}
	return -1;
}

DomManager.prototype.getTimeIndex = function(time) {
	for (var i = 0; i < this.threadList.length; i++) {
		if (time < this.threadList[i].updateTime) return i;
	}
	return this.threadList.length;
}

DomManager.prototype.shiftThreadsDown = function(index) {
	for (var i = this.threadList.length - 1; i >= index; i--) {
		if (i === this.threadList.length - 1) {
			this.threadList.push(this.threadList[i]);
		} else {
			this.threadList[i+1] = this.threadList[i];
		}
		$('#thread-'+i).attr( 'id','thread-'+(i + 1) );
	}
}

DomManager.prototype.drawThread = function(event) {
	var time = event.mostRecent;
	var index = this.getTimeIndex(time);
	var html;
	if (index === this.threadList.length) {
		this.threadList.push({
			eid : event.eid,
			updateTime : time,
		});
		html = this.writeThreadHtml(event, index);
		$('#thread-list').append(html);
	} else {
		this.shiftThreadsDown(index);
		this.threadList[index] = {
			eid : event.eid,
			updateTime : time,
		};
		html = this.writeThreadHtml(event, index);
		$( '#thread-'+(index + 1) ).before(html);
	}
}

DomManager.prototype.drawMessage = function(message) {
	var event = ELM.getEvent(message.eid);
	var sender = event.getUser(message.uid);
	var html = this.writeMessageHtml(sender, message);
	var thread = this.getThread(event.eid);
	$('#thread-'+thread+' .message-list').append(html);
}

////////////////////////////////////////////////////////////////////////////////

DomManager.prototype.writeThreadHtml = function(event, index) {
	var html = '<li id="thread-'+index+'" class="thread">';
	html += this.writeInviteListHtml(event);
	html += '<h2 class="thread-title">'+event.messageList[0].text+'</h2>';
	html += this.writeGuestListHtml(event);
	html += this.writeMessageChainHtml(event);
	html += '</li>';
	return html;
}

DomManager.prototype.writeUserImgHtml = function(name, pic) {
	return '<li><img title="'+name+'" src="'+pic+'"></li>';
}

DomManager.prototype.writeInviteListHtml = function(event) {
	var html = '<ul class="invite-list">';
	for (var user in event.inviteList) {
		user.getInfo(function(name, pic) {
			if (!event.isGuest(user.uid)) {
				html += this.writeUserImgHtml(name, pic);
			}
		});
	}
	html += '</ul>';
	return html;
}

DomManager.prototype.writeGuestListHtml = function(event) {
	var html = '<ul class="guest-list">';
	var user;
	for (var uid in event.guestList) {
		user = event.getUser(uid);
		html += this.writeUserImgHtml(name, pic);
	}
	html += '</ul>';
	return html;
}

DomManager.prototype.writeMessageHtml = function(sender, message) {
	var html = 
		'<li class="message">'+
			'<img class="message-pic" title="'+sender.name+'" src="'+sender.pic+'">'+
			'<p class="message-time">'+message.creationTime+'</p>'+
			'<p class="message-name">'+sender.name+'</p>'+
			'<p class="message-text">'+message.text+'</p>'+
		'</li>';
	return html;
}

DomManager.prototype.writeMessageChainHtml = function(event) {
	var html = '<div class="message-chain"><ul class="message-list">';
	var message, sender;
	for (var i = 0; i < messageList.length; i++) {
		message = messageList[i];
		sender = event.getUser(message.uid);
		html += this.writeMessageHtml(sender, message);
	}
	html += '</ul>'+
		'<form class="message-form hidden">'+
			'<input type="text" name="message" autocomplete="off" placeholder="Enter a message.">'+
			'<input type="submit" value="Send">'+
		'</form></div>';
	return html;
}