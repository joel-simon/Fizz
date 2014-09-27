# onSms = require('./smsHandler.js');
models = require('./models')
utils  = require('./utilities')


module.exports = (app, io, passport) ->
  output = require('./output')(io)
  loginOptions = 
    successRedirect: '/success'
    failureRedirect: '/fail'
    failureFlash: false

  app.post('/login', passport.authenticate('local', loginOptions))
  
  app.get '/success', (req, res) ->
    res.send 200
  
  app.get '/fail', (req, res) ->
    res.send 401

  app.post '/join', (req, res) ->
    { key } = req.body
    models.invites.get {key}, (err, invite) ->
      return res.send 400 if err?
      models.invites.accept invite, (err) ->
        return res.send 400 if err?
        utils.log "Joined by sms", invite
        res.send 200

  app.post '/leave', (req, res) ->
    { key } = req.body
    models.invites.get {key}, (err, invite) ->
      return res.send 400 if err?
      models.invites.unaccept invite, (err) ->
        return res.send 400 if err?
        utils.log "Left by sms", invite
        res.send 200

  app.post '/registration', (req, res) ->
    utils.log 'On registration data', req.body
    { firstName, lastName, platform, phoneToken, pn } = req.body
    phoneToken = phoneToken || 'no phoneToken'
    if !firstName || !lastName || !platform || !pn
      return res.send 400, 'invalid body paramaters'
    
    name = "#{firstName} #{lastName}"
    models.users.isVerified {pn}, (err, isVerified) ->
      return res.send 400 if err?
      if not isVerified?
        models.users.create pn, name, platform, phoneToken, done
      else
        models.users.newPassword {pn}, done
      
    done = (err, user, password) ->
      if err?
        utils.logError err
        return res.send 400 
      utils.log 'registration successful', 'password:'+password
      output.sendSms 'Your Fizz code:'+password, {pn, name, platform}
      # console.log !!res, !!res.send
      res.send 200
      
  app.get '/e/:key', (req, res) ->
    key = req.params.key
    models.invites.get {key}, (err, {eid, uid, inviter, accepted}) ->
      return res.send 404 if err or not eid?
      models.users.get {uid}, (err, user) ->
        return res.send 404 if err?
        models.events.getFull eid, (err, event, messages, inviteList, guests) ->
          utils.logError err if err?
          if err || ! event
            return res.send 404
          guestList= inviteList.filter (user) -> guests.indexOf(user.uid) >= 0
          noReply  = inviteList.filter (user) -> guests.indexOf(user.uid) == -1
          creator  = inviteList.filter((user) -> user.uid == event.creator )[0]
          res.render 'event.jade', { user, accepted, event, creator, messages, noReply, guestList, key}

  app.get '/', (req, res) ->
    res.send 'Fizz'
  
  app.get '*', (req, res) -> res.render '404', { title: 'Page Not Found' }
