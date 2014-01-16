var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';


var s3 = new AWS.S3({params: {Bucket: 'myBucket', Key: 'myKey'}});
s3.createBucket(function() {
  s3.putObject({Body: 'Hello!'}, function() {
    console.log("Successfully uploaded data to myBucket/myKey");
  });
});