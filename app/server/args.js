module.exports = exports;
process.argv.forEach(function (val, index) {
  if (index > 1) {
    switch(val.split('=')[0]) {
      case 'port':
        val = val.split('=');
        if (val.length !== 2 || typeof val[1] != 'number')
          throw "Invalid Port, use 'port=x'"
        exports.port = val[1]
        break;
      case 'test':
        exports.testing = true;
        break;
      case 'dev':
        exports.dev = true;
        break
      default:
        console.log('Invalid command "%s" Run "node app test" to run in test mode',val)
    }
  }
});