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

exports = exports;

exports.log = function() {
	var s = '\tInfo: ';
	var e;
	for (var i = 0; i < arguments.length; i++) {
		e = arguments[i];
		s += ((e instanceof Object) ? JSON.stringify(e, null, '') : e)+' ';
	}
  // JSON.stringify({"foo":"lorem","bar":"ipsum"}, null, '\t');
	console.log(s.data);
  console.log('\t'+'———————————————————————————————————————————————————————————————'.data);
}

exports.logImportant = function() {
  var s = '\tInfo: ';
  var e;
  for (var i = 0; i < arguments.length; i++) {
    e = arguments[i];
    s += ((e instanceof Object) ? JSON.stringify(e) : e)+' ';
  }
  console.log(s.info);
  console.log('\t'+'———————————————————————————————————————————————————————————————'.info);
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
  if (!split.length) {
    return s
  } else {
    var first = split[0];
    var last = split[split.length-1][0];
    return first+' '+last +'.'  
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

function foo() {
  function getErrorObject(){
      try { throw Error('') } catch(err) { return err; }
    }
    var err = getErrorObject();
    var caller_line = err.stack.split("\n")[4];
    var index = caller_line.indexOf("at ");
    var clean = caller_line.slice(index+2, caller_line.length);
    console.log(clean);
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
    s+= ('Error: '+JSON.stringify(e)).bold.error;
  } else {
    s+= ('Error: '+e).bold.error;
  }

  s+='\n\t'+date.error;

  var pattern = "/Users/joelsimon/Projects/Fizz/";
  var stackTrace = getStackTrace().replace(/    /g, '\t')
  stackTrace = stackTrace.replaceAll(pattern, '');
  
	s += ('\n\t'+stackTrace.error+'\n');
  console.log(s);
  
 //  fs.appendFile("./err.txt", s, function(err2) {
 //    if(err2) {
 //      console.log(err2);
 //    }
	// }); 
}
function getStackTrace() {
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}



exports.isSubset = function(a, b) {
	if (a.length > b.length) return false;
	a.sort();
	b.sort();
	for (var i = 0; i < a.length; i++) {
		if (binaryIndexOf(b, a[i]) < 0) return false;
	}
	return true;
}
function binaryIndexOf(arr, e) {
  var minIndex = 0;
  var maxIndex = arr.length - 1;
  var currentIndex;
  var currentElement;

  while (minIndex <= maxIndex) {
    currentIndex = (minIndex + maxIndex) / 2 | 0;
    currentElement = arr[currentIndex];
    if (currentElement < e) minIndex = currentIndex + 1;
    else if (currentElement > e) maxIndex = currentIndex - 1;
    else return currentIndex;
  }

  return -1;
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
