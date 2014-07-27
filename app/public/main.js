$(function(){
  console.log('test');
  function generateNumber() {
    var text = "";
    var possible = "0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  $.ajax({
    type: "POST",
    url: 'http://localhost:9001/login',
    data: {
      pn: '0148718817',
      password: '060608'
    },
    success: function(data, status) {
      console.log('testdsads');
      console.log(io);
      var socket = io.connect('http://localhost');
        socket.on('onLogin', function (data) {
        console.log(data);
      });
    }
  });
});