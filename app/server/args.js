module.exports = exports;
exports.sendSms = false;
exports.pushIos = false;
exports.dev= false;
exports.test = false;
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
      case 'sendSms':
        exports.sendSms = true;
        break;
      case 'pushIos':
        exports.pushIos = true;
        break;
      default:
        console.log('Valid commands : "test", "pushIos", "sendSms".');
    }
  }
});