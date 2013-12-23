/**
 * Example dependencies / constants
 */

var apnagent = require('apnagent')
  , express = require('express')
  , join = require('path').join
  , port = process.env.PORT || 8080;

/**
 * Create application
 */

var app = express()
  , server = require('http').createServer(app);

/**
 * Configure Express
 */

app.configure(function () {
  app.use(express.bodyParser());
});

// /**
//  * Use a MockAgent for dev/test envs
//  */

// app.configure('development', 'test', function () {
//   var agent = new apnagent.MockAgent();

//   // no configuration needed

//   // mount to app
//   app
//     .set('apn', agent)
//     .set('apn-env', 'mock');
// });

// *
//  * Usa a live Agent with sandbox certificates
//  * for our staging environment.
 

// app.configure('staging', function () {
//   var agent = new apnagent.Agent();

//   // configure agent
//   agent 
//     .set('cert file', join(__dirname, 'app-cert.pem'))
//     .set('key file', join(__dirname, 'app-key.pem'))
//     .enable('sandbox');

//   // mount to app
//   app
//     .set('apn', agent)
//     .set('apn-env', 'live-sandbox');
// });

/**
 * Use a live Agent with production certificates
 * for our production environment.
 */

// app.configure('production', function () {
  var agent = new apnagent.Agent();

  // configure agent
  agent 
    .set('cert file', join(__dirname, 'app-cert.pem'))
    .set('key file', join(__dirname, 'app-key.pem'));

  // mount to app
  app
    .set('apn', agent)
    .set('apn-env', 'live-production');
// });

/**
 * Set our environment independant configuration
 * and event listeners.
 */

app.configure(function () {
  var agent = app.get('apn')
    , env = app.get('apn-env');

  // common settings
  agent
    .set('expires', '1d')
    .set('reconnect delay', '1s')
    .set('cache ttl', '30m');

  // see error mitigation section
  agent.on('message:error', function (err, msg) {
    // ...
  });

  // connect needed to start message processing
  agent.connect(function (err) {
    if (err) throw err;
    console.log('[%s] apn agent running', env);
  });
});

/**
 * Sample endpoint
 */
setTimeout(function(){
// app.post('/apn', function (req, res) {
  var agent = app.get('apn')
    , alert = 'Hello World'//req.body.alert
    , token = 'BC45506F3DD570B9C51363068DFBEF0FE178B7F7318D3CA7485F6040F980B74A';
    //req.body.token;

  agent.createMessage()
    .device(token)
    .alert(alert)
    .send(function (err) {
      // handle apnagent custom errors
      if (err && err.toJSON) {
        console.log(err.toJSON(false));
        // res.json(400, { error: err.toJSON(false) });
      } 

      // handle anything else (not likely)
      else if (err) {
        console.log(err);
        // res.json(400, { error: err.message });
      }

      // it was a success
      else {
        console.log('success')''
        // res.json({ success: true });
      }
    });
}, 1000);
// });

/**
 * Start server
 */

server.listen(port, function () {
  console.log('http started on port %d', server.address().port);
});