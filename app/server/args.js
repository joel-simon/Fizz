module.exports = exports;

process.argv.forEach(function (val, index) {
  if (index > 1) {
    split = val.split('=')
    switch(split[0]) {
      case 'port':
        if (split.length !== 2 || typeof parseInt(split[1]) != 'number')
          throw "Invalid Port, use 'port=x'"
        exports.port = parseInt(parseInt(split[1]))
        break;
      case 'test':
        exports.testing = true;
        break;
      case 'dev':
        exports.dev = true;
        exports.sendSms = true;
        break
      default:
        console.log('Valid commands: [dev, port=n, test]');
        console.log(val);
    }
  }
});