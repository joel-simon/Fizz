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

DomManager.prototype.getRanking = function(event) {
	if (event.creator === MIM.me) {
		return 5;
	} else if (event.isGuest(MIM.me)) {
		return 4;
	} else if (event.inviteOnly) {
		return 3;
	} else if (MIM.friendList.hasUser(event.creator)) {
		return 2;
	} else { // FoF event
		return 1;
	}
}

DomManager.prototype.higherRanking = function(contender, existing) {
	var contenderRanking = DM.getRanking(contender);
	var existingRanking = DM.getRanking(existing);
	if (contenderRanking > existingRanking) {
		return true;
	} else if (contenderRanking < existingRanking) {
		return false;
	} else if (contender.updateTime > existing.updateTime) {
		return true;
	} else {
		return false;
	}
}

DomManager.prototype.getThreadIndex = function(event) {
	var tempEvent;
	for (var i = 0; i < this.threadList.length; i++) {
		tempEvent = this.threadList[i];
		if ( DM.higherRanking(event, tempEvent) ) return i;
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
		$( '#thread-'+(i+1) ).append( $('#thread-'+i).children() );
	}
}

DomManager.prototype.drawThread = function(event) {
	var next = this.threadList.length;
	var newThread = '<li id="thread-'+next+'" class="thread"></li>';
	$('#thread-list').append(newThread);
	setCollapseListener(next);

	var index = this.getThreadIndex(event);
	var html;
	if (index === this.threadList.length) {
		this.threadList.push({
			eid : event.eid,
			updateTime : time,
		});
		html = this.writeThreadHtml(event, index);
		$('#thread-'+index).append(html);
		setDetailListener(event.eid);
		setMessageFormListener(event.eid);
	} else {
		this.shiftThreadsDown(index);
		this.threadList[index] = {
			eid : event.eid,
			updateTime : time,
		};
		html = this.writeThreadHtml(event, index);
		$('#thread-'+index).append(html);
		setDetailListener(event.eid);
		setMessageFormListener(event.eid);
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
	var html = this.writeInviteListHtml(event);
	html += '<h2 class="thread-title">'+event.messageList[0].text+'</h2>';
	html += this.writeGuestListHtml(event);
	html += this.writeMessageChainHtml(event);
	return html;
}

DomManager.prototype.writeUserImgHtml = function(name, pic) {
	return '<li><img title="'+name+'" src="'+pic+'"></li>';
}

DomManager.prototype.writeInviteListHtml = function(event) {
	var html = '<ul class="invite-list">';
	var self = this;
	var user;
	for (var id in event.inviteList.table) {
		user = event.getUser(id);
		if (!event.isGuest(user.uid)) {
			user.getInfo(function(name, pic) {
				html += self.writeUserImgHtml(name, pic);
			});
		}
	}
	html += '</ul>';
	return html;
}

DomManager.prototype.writeGuestListHtml = function(event) {
	var html = '<ul class="guest-list">';
	var self = this;
	var user;
	for (var id in event.inviteList.table) {
		user = event.getUser(id);
		if (event.isGuest(user.uid)) {
			user.getInfo(function(name, pic) {
				html += self.writeUserImgHtml(name, pic);
			});
		}
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
	for (var i = 0; i < event.messageList.length; i++) {
		message = event.messageList[i];
		sender = event.getUser(message.uid);
		html += this.writeMessageHtml(sender, message);
	}
	html += '</ul>'+
		'<form id="mf-'+event.eid+'" class="message-form hidden">'+
			'<input type="text" name="message" autocomplete="off" placeholder="Enter a message.">'+
			'<input type="submit" value="Send">'+
		'</form></div>';
	return html;
}