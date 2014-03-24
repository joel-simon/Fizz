////////////////////////////////////////////////////////////////////////////////
/*
	Onload Tests - Starts Many useful tests
*/
////////////////////////////////////////////////////////////////////////////////

function testEvents() {
	var time = Date.now();

	// My Info
	var me = {
		fbid      : 798172051,
		logged_in : true,
		name      : "Daniel Belchamber",
		pn        : "3016420019",
		type      : "Guest",
		uid       : 1,
	}

	// Event 1
	var m11 = {
		mid          : 1,
		eid          : 1,
		uid          : 1,
		text         : 'Event 1',
		creationTime : time - 500,
	}

	var m12 = {
		mid          : 2,
		eid          : 1,
		uid          : 1,
		text         : 'Event 1: message 2',
		creationTime : time - 200,
	}

	var e1 = {
		eid         : 1,
		creator     : 1,
		guestList   : [1],
		inviteList  : [me],
		seats       : 1,
		messageList : [m11, m12],
		inviteOnly  : true,
	}


	// Event 2
	var m21 = {
		mid          : 1,
		eid          : 1,
		uid          : 1,
		text         : 'Event 2',
		creationTime : time - 450,
	}

	var m22 = {
		mid          : 2,
		eid          : 1,
		uid          : 1,
		text         : 'Event 2: message 2',
		creationTime : time - 300,
	}

	var e2 = {
		eid         : 2,
		creator     : 1,
		guestList   : [1],
		inviteList  : [me],
		seats       : 1,
		messageList : [m21, m22],
		inviteOnly  : true,
	}


	// Event 3
	var m31 = {
		mid          : 1,
		eid          : 1,
		uid          : 1,
		text         : 'Event 3',
		creationTime : time,
	}

	var e3 = {
		eid         : 3,
		creator     : 1,
		guestList   : [1],
		inviteList  : [me],
		seats       : 1,
		messageList : [m31],
		inviteOnly  : true,
	}

	ELM.addEvent(e1);
	ELM.addEvent(e2);
	ELM.addEvent(e3);
	// setTimeout(function() {
	// 	ELM.addEvent(e3);
	// }, 10000)
}