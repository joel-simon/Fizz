var config  = require('./../../config.json');
var AWS = require('aws-sdk'); 

AWS.config.update(config.AWS);

// console.log(config.AWS);

var db = new AWS.DynamoDB();
module.exports = exports = db;

args     = require('./args.js');

if ( args.testing ) {

	// db.describeTable({TableName: 'users'}, function(err, data) {
	//   if (err) console.log(err, err.stack); // an error occurred
	//   else     console.log(data);           // successful response
	// });


	// db.deleteTable({TableName: 'users'}, function(err, data) {
	//   if (err) console.log(err, err.stack); // an error occurred
	//   else createUserTable();
	// });
	// createUserTable();
}
function createUserTable() {
	var params = {
	  AttributeDefinitions: [ // required
	    {
	      AttributeName: 'uid', // required
	      AttributeType: 'N', // required
	    }
	    // ... more items ...
	  ],
	  KeySchema: [
	    {
	      AttributeName: 'uid',
	      KeyType: 'HASH',
	    },
	  ],
	  ProvisionedThroughput: {
	    ReadCapacityUnits: 1,
	    WriteCapacityUnits: 1,
	  },
	  TableName: 'users'
	};
	db.createTable(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});
}