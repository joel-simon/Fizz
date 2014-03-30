////////////////////////////////////////////////////////////////////////////////
/*
	Scroll Manager - manages the many ways of scrolling through the expanded
		thread-list
*/
////////////////////////////////////////////////////////////////////////////////

var SM = new ScrollManager();

function ScrollManager() {
	this.currentThread = 0;
	this.threadCount = $('.thread').length;
	this.countDown = null;

	resetStyle();
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

ScrollManager.prototype.scrollToThread = function(thread) {
	var height = $(window).height();
	var scroll = thread*height;
	$('#thread-list').animate({'scrollTop': scroll}, 100, function() {
		this.currentThread = thread;
	});
}

////////////////////////////////////////////////////////////////////////////////

function centerTitles() {
	var titleSelector = $('.thread-title');
	var width = $(window).width();
	var title, titleWidth;
	for (var i = 0; i < titleSelector.length; i++) {
		title = titleSelector[i];
		titleWidth = $(title).width();
		$(title).css( 'margin-left', ((width - titleWidth)/2 - 28.8)+'px' );
	}
}

function resetStyle() {
	var thread = this.currentThread;
	$('#thread-'+(thread-1)+' .thread-title').css('margin-top', '45vh');
	$('#thread-'+thread).css('background-color', 'rgb(255,255,255)');
	$('#thread-'+thread+' .thread-title').css('margin-top', '-5vh');
	$('#thread-'+(thread+1)+' .thread-title').css('margin-top', '-55vh');
	centerTitles();
}

function getMargin(thread) {
	var scroll = $('#thread-list').scrollTop();
	var height = $(window).height();
	var near = SM.getNearestThread();

	if (thread - 2 >= near) {
		return {
			'margin-top'    : '-55vh',
		}
	} else if (thread + 2 <= near) {
		return {
			'margin-top'    : '45vh',
		}
	} else if (thread > near) {
		if (scroll <= near*height) {
			return {
				'margin-top'    : '-55vh',
			}
		} else {
			var x = scroll - (near*height);
			var y = (x/height)*50;
			var z = 55 - y;
			return {
				'margin-top'    : '-'+z+'vh',
			}
		}
	} else if (thread < near) {
		if (scroll >= near*height) {
			return {
				'margin-top'    : '45vh',
			}
		} else {
			var x = (near*height) - scroll;
			var y = (x/height)*50;
			var z = 45 - y;
			return {
				'margin-top'    : z+'vh',
			}
		}
	} else {
		if (thread*height >= scroll) {
			var x = (thread*height) - scroll;
			var y = (x/height)*(-50) - 5;
			return {
				'margin-top'    : y+'vh',
			}
		} else {
			var x = scroll - (thread*height);
			var y = (x/height)*50 - 5;
			return {
				'margin-top'    : y+'vh',
			}
		}
	}
}

function getBackgroundColor(thread) {
	var scroll = $('#thread-list').scrollTop();
	var height = $(window).height();
	var low = 220;
	var high = 255;
	var range = high - low;

	var distUp = scroll - thread*height;
	
	if ( distUp > height || distUp < -height ) {
		return 'rgb('+low+','+low+','+low+')';
	} else if (distUp >= 0) {
		var x = distUp/height;
		var y = x*range;
		var z = Math.floor(high - y);
		return 'rgb('+z+','+z+','+z+')';
	} else {
		var distDown = Math.abs(distUp);
		var x = distDown/height;
		var y = x*range;
		var z = Math.floor(high - y);
		return 'rgb('+z+','+z+','+z+')';
	}
}

function parallax() {
	var threadList = $('.thread');
	var margin, backColor;
	for (var i = 0; i < threadList.length; i++) {
		margin = getMargin(i);
		$( threadList[i] ).children('.thread-title').css(margin);
		backColor = getBackgroundColor(i);
		$( threadList[i] ).css('background-color', backColor);
	}
}

////////////////////////////////////////////////////////////////////////////////

$(window).on('resize', function() {
	SM.scrollToThread(SM.currentThread);
});

$('#thread-list').on('scroll', function() {
	if (!collapse) {
		parallax();
		clearTimeout(SM.countDown);
		SM.countDown = setTimeout(function() {
			var thread = SM.getNearestThread();
			SM.currentThread = thread;
			SM.scrollToThread(thread);
		}, 100);
	}
});