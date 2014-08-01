var colors  = require('colors');
var fs = require('fs');
var debug = true;
var sanitize = require('validator').sanitize;
var stackTrace = require('stack-trace');
colors.setTheme({
  info: 'green',
  debug: 'blue',
  error: 'red',
  data: 'grey'
});

module.exports = exports;

exports.getUserSession = function(socket) {
  return socket.handshake.user
}

var mail = require("nodemailer").mail;
exports.log = function() {
  var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  date = date.substring(0,date.search("GMT")-1);

	var main = 'Info- ';
	var e;
  var more = ''
	for (var i = 0; i < arguments.length; i++) {
		e = arguments[i];
		var s = ((e instanceof Object) ? JSON.stringify(e, null, '') : e)+' ';
    if (i == 0) {
      main += s;
      // main += ' @'+date;
    } else {
      more += '\n  '+s;
    }
	}
	console.log(main, more.data);
  console.log('————————————————————————————————————————————————————————————————————————————————'.data);
}

exports.debug = function() {
	if(!debug) return;
	var s = '\tInfo: ';
	var e;
	for (var i = 0; i < arguments.length; i++) {
		e = arguments[i];
		s += ((e instanceof Object) ? JSON.stringify(e) : e)+' ';
	}
	console.log(s.debug);
}

exports.nameShorten = function(s) {
  var split = s.split(' ');
  // console.log(s, split);
  if (split.length !== 2) {
    return s
  } else {
    var first = split[0];
    var last = split[split.length-1][0];
    return first+' '+last +''  
  }
}

function convertToServerTimeZone(){
  //EST
  offset = -4.0
  clientDate = new Date();
  utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
  serverDate = new Date(utc + (3600000*offset));
  return (serverDate.toLocaleString());
}

exports.logError = function(e) {
  if (!e) return;
  var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  date = date.substring(0,date.search("GMT")-1)

  var s = '\t'
	// s += __line + __function;

  if (e instanceof EvalError) {
    s+=('EvalError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof RangeError) {
    s+=('EvalError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof ReferenceError) {
    s+=('ReferenceError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof SyntaxError) {
    s+=('SyntaxError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof TypeError) {
    s+=('TypeError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof URIError) {
    s+=('URIError: '+e.name + ": " + e.message).bold.error;
  } else if (e instanceof Object) {
    s+= ('Error -'+JSON.stringify(e)).bold.error;
  } else {
    s+= ('Error -'+e).bold.error;
  }

  s+='\n\t'+date.error;

  var pattern = "/Users/joelsimon/Projects/Fizz/";
  var stackTrace = getStackTrace().replace(/  /g, '\t')
  stackTrace = stackTrace.replaceAll(pattern, '');
  
	s += ('\n\t'+stackTrace.error);
  console.log(s);
  console.log('\t'+'———————————————————————————————————————————————————————————————'.data);
  // mail({
  //   from: "<errors@fizz.com>", // sender address
  //   to: "joelsimon6@gmail.com", // list of receivers
  //   subject: "You fucked up.", // Subject line
  //   text: s, // plaintext body
  //   html: "<b>"+JSON.stringify(s)+"</b>" // html body
  // });
}
function getStackTrace() {
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}

exports.isPn = function(pn) {
  var regexp = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/
  return (regexp.test(pn));
}

exports.formatPn = function(pn) {
  pn = pn.replace(/ /g,'');
  if (pn[0] !== '+') pn = '+'+pn;
  if (pn [1] !== '1') {
    pn = '+1'+pn.substring(1);
  }
  return pn;
}

Object.defineProperty(global, '__stack', {
get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
get: function() {
        return __stack[1].getFunctionName();
    }
});


String.prototype.replaceAll = function(str1, str2, ignore) 
{
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

