// server manager

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
var dynamodb = new AWS.DynamoDB();
var table = 'Beacon1';

//@ id - int
//@ friends - string
function addPlayer (id, friends) {
	console.log(typeof friends);
	var item = {'fbId': {'N': id},
							'what': {'N': '42'},
				      'friends': {'S': JSON.stringify(friends)},
				    	}
	dynamodb.putItem({'TableName': table, 'Item': item}, function (err, data) {
	  if (err) {
      console.log('ERR Putting:', err); // an error occurred
	  } else {
      console.log('PLAYER ENTERED:'); // successful response
    }
  });

}


function getFriends(id, callback) {
	// var query = {
	// 	TableName: 'Beacon1',
	// 	KeyConditions : {
	// 		'Id' : {ComparisonOperator: "GT", AttributeValueList: [{'N' : fbid}]}
	// 	}
	// }
	var query = {
		'AttributesToGet': 'friends',
		'TableName': 'Beacon',
		'Key' : {'N': id}
	}
	// dynamodb.query(query, function (err, data) {
	dynamodb.scan({'TableName': 'Beacon'}, function (err, data) {
    if (err){ return (console.log('ERRQuery:', err)); }
    for (var i = 0; i < data.Items.length; i++) {
    	var elem = data.Items[i];
    	if (elem.fbId.N == id) return callback(elem.fbId.N, JSON.parse(elem.friends.S));
    };
    callback(false, false);
	});
}

module.exports.addPlayer = addPlayer;
module.exports.getFriends = getFriends;