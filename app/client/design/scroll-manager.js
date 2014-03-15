////////////////////////////////////////////////////////////////////////////////
/*
	ScrollManager - manages the many ways of scrolling through the expanded
		thread-list
*/
////////////////////////////////////////////////////////////////////////////////

var SM = new ScrollManager();

function ScrollManager() {
	this.currentThread = 0;
	this.threadCount = $('.thread').length;
	this.countDown = null;
}

ScrollManager.prototype.isAnimated = function() {
	return $('#thread-list').is(':animated');
}

ScrollManager.prototype.getCurrentThreadSelector = function() {
	var thread = this.currentThread;
	return $('#thread-'+thread);
}

ScrollManager.prototype.getNearestThread = function() {
	var scroll = $('#thread-list').scrollTop();
	var height = $(window).height();
	var thread = Math.floor( (scroll+height/2)/height );
	return thread;
}

ScrollManager.prototype.scrollToThread = function(thread, callback) {
	$('#thread-list').stop();
	var height = $(window).height();
	var scroll = thread*height;
	$('#thread-list').animate({'scrollTop': scroll}, 500, function() {
		this.currentThread = thread;
		console.log(Date.now(), 'scrolled to '+thread);
		if (callback) callback();
	});
}

ScrollManager.prototype.scrollUp = function(callback) {
	if (this.currentThread - 1 >= 0) {
		callback( this.scrollToThread(this.currentThread - 1) );
	}
}

ScrollManager.prototype.scrollDown = function(callback) {
	if (this.currentThread + 1 < this.threadCount) {
		callback( this.scrollToThread(this.currentThread + 1) );
	}
}

////////////////////////////////////////////////////////////////////////////////

function hidePaginationButtons() {
	var thread = SM.getCurrentThreadSelector();
	var pagination = thread.children('.pagination');
	var top = $( pagination[0] );
	var bot = $( pagination[1] );
	if ( !top.hasClass('hidden') ) {
		top.addClass('hidden');
	}
	if ( !bot.hasClass('hidden') ) {
		bot.addClass('hidden');
	}
}

function showPaginationButtons() {
	var thread = SM.getCurrentThreadSelector();
	var pagination = thread.children('.pagination');
	var top = $( pagination[0] );
	var bot = $( pagination[1] );
	if ( !top.hasClass('end') ) {
		top.removeClass('hidden');
	}
	if ( !bot.hasClass('end') ) {
		bot.removeClass('hidden');
	}
}

////////////////////////////////////////////////////////////////////////////////

// setInterval(function() {
// 	console.log(SM.countDown);
// }, 200);

$('#thread-list').on('scroll', function() {
	hidePaginationButtons();
	clearTimeout(SM.countDown);
	SM.countDown = setTimeout(function() {
		var thread = SM.getNearestThread();
		SM.currentThread = thread;
		SM.scrollToThread(thread, function() {
			showPaginationButtons();
		});
	}, 500);
});

$('.thread-top').on('click', function() {
	hidePaginationButtons();
	SM.scrollUp(function() {
		showPaginationButtons();
	});
});

$('.thread-bot').on('click', function() {
	hidePaginationButtons();
	SM.scrollDown(function() {
		showPaginationButtons();
	});
});