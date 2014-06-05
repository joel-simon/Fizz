var dbstring = 'postgres://Fizz:derptopia@fizzdbinstance.cdzhdhngrg63.us-east-1.rds.amazonaws.com:5432/fizzdb';
function getUserSession(socket) {
  var user = socket.handshake.user;
  check.is(user, 'user');
  return user;
}
module.exports = function(data, socket) {
  console.log('locationChange: data', data);
  var q1 = "update users set last_location = (lat,lng) where uid = $2";
  var q2 = "SELECT (uid, last_location, eid)"+
    "FROM invites as a, invites as b, events, users as u WHERE"+
    "a.eid = b.eid AND a.eid = e.eid AND"+
    "a.uid = my_uid and"+
    "b.uid = u.uid"+
    "and a.accepted = true and b.accepted = true and"+
    "e.last_cluster_update < (NOW()-INTERVAL '4 minutes')"
  var q3 = 'UPDATE events SET last_cluster_update = NOW()';

  db.transaction([q1, q2, q3],[[],[],[]], function(err, results) {
    if (err) logError (err);
  });

}