args = require './../args.js'
config = require './../config'
redis   = require 'redis'
rtg = require("url").parse config.DB.REDISTOGO_URL

createClient = () ->
  client = redis.createClient rtg.port, rtg.hostname
  client.auth rtg.auth.split(":")[1], (err) -> throw err if err
  setInterval (() -> client.set('foo','bar')), 5*60*1000
  client


# pub   = redis.createClient rtg.port, rtg.hostname
# sub   = redis.createClient rtg.port, rtg.hostname
# store = redis.createClient rtg.port, rtg.hostname

# pub.auth rtg.auth.split(":")[1], (err) -> throw err if err
# sub.auth rtg.auth.split(":")[1], (err) -> throw err if err
# store.auth rtg.auth.split(":")[1], (err) -> throw err if err

module.exports.store = createClient()
# module.exports.pub = pub
# module.exports.sub = sub


