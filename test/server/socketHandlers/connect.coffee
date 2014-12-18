chai = require("chai")
sinon = require("sinon")
sinonChai = require("sinon-chai")
expect = chai.expect
chai.use(sinonChai)
async = require 'async'
root = '../../../app/server/'
init = require '../../../scripts/init'
models = require(root+'models')
handlers = require(root+'socketHandlers')

makeSocket = (user) ->
  {
    handshake:
      user: user
    join : () ->
    emit : () ->
  }

output = 
  emit: () ->
  push: () ->

populateTests = (callback) ->
  async.series [
    (cb) -> init cb
    (cb) -> models.users.create "+13475346100", "Joel Simon", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+13107102956", "Andrew Sweet", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+19494647070", "Antonio Ono", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+13523189733", "Russell Cullen", "android", "PHONETOKEN", cb
   ], (err, results) ->
    users = []
    for elem, i in results
      if i != 0
        users.push elem[0]
    return callback err if err?
    callback null, {users}

describe 'connect', () ->
  before (done) =>
    populateTests (err, data) =>
      @users = data.users
      @sockets = data.users.map ((user) -> makeSocket user)
      return done err if err?
      done()

  describe 'With nothing new', () =>
    before (done) =>
      @sockets[0].emit = sinon.spy()
      handlers.connect @sockets[0], done
    it 'emits the correct thing', () =>
      data =
        eventList: []
        guests: {  }
        me: @users[0]
        newInvitees: {  }
        newMessages: {  }
      expect(@sockets[0].emit).to.be.calledWithExactly 'onLogin', data

  describe 'With a new event', () =>
    #
    # user 1 invites user 0 to a new event
    #
    event = { description: 'An event' }
    before (done) =>
      async.series [
        (cb) => handlers.postNewEvent event, @sockets[1], output, cb
        (cb) => models.invites.addList 1, @users[1].uid, [@users[0]], cb
        (cb) => handlers.connect @sockets[0], cb
        (cb) => handlers.disconnect @sockets[0], cb
      ], done
    it 'emits the new event on the first connect', () =>
      data =
        eventList: [{ "eid":1,"numM":0,"completed":false,"description":"An event" }]
        guests: { 1: [ @users[1].uid ] }
        me: @users[0]
        newInvitees:
          1: [ @users[1], @users[0] ]
        newMessages: {}
      firstCall = @sockets[0].emit.getCall(1).args
      expect(firstCall[0]).to.equal 'onLogin'
      expect(firstCall[1]).to.deep.equal data

  describe "Connect again with no changes", () =>
    before (done) =>
      async.series [
        (cb) => handlers.connect @sockets[0], cb
        (cb) => handlers.disconnect @sockets[0], cb
      ], done
    it 'does not emit the new initees on second connect', () =>
      data = {
        eventList: [ 
          { "eid":1,"numM":0,"completed":false,"description":"An event" }
        ]
        guests: {}
        me: @users[0]
        newInvitees: {}
        newMessages: {}
      }
      secondCall = @sockets[0].emit.getCall(2).args
      expect(secondCall[0]).to.equal 'onLogin'
      expect(secondCall[1]).to.deep.equal data

  describe "Connect again with changes", () =>
    #
    # User 1 invites user 2 who joins and posts a message.
    #
    message = { eid: 1, text: 'myMessage' }
    before (done) =>
      async.series [
        (cb) => models.invites.addList 1, @users[1].uid, [@users[2]], cb
        (cb) => handlers.postJoinEvent { eid:1 }, @sockets[2], output, cb
        (cb) => handlers.postNewMessage message, @sockets[2], output, cb
        (cb) => handlers.connect @sockets[0], cb
        (cb) => handlers.disconnect @sockets[0], cb
      ], done
    it 'displays new guest and their message', (done) =>
      models.messages.getMoreMessages 1, 1, (err, messages) =>
        data = {
          me: @users[0]
          eventList: [{ "eid":1,"numM":1,"completed":false,"description":"An event" }]
          guests: { 1 : [ @users[1].uid, @users[2].uid ] }
          newInvitees: { 1 : [ @users[2] ] }
          newMessages: { 1 : messages }
        }
        thirdconnect = @sockets[0].emit.getCall(3).args
        expect(messages.length).to.equal 1
        expect(thirdconnect[0]).to.equal 'onLogin'
        expect(thirdconnect[1]).to.deep.equal data
        done()

    # it 'emits the right event list after an event has been ended', () =>
    #   data = {
    #     eventList: [ ]
    #     guests: { }
    #     me: @users[0]
    #     newInvitees: { }
    #     newMessages: { }
    #   }
    #   thirdCall = @sockets[0].emit.getCall(3).args
    #   expect(thirdCall[0]).to.equal 'onLogin'
    #   expect(thirdCall[1]).to.deep.equal data


