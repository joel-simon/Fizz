chai = require("chai")
sinon = require("sinon")
sinonChai = require("sinon-chai")
expect = chai.expect
chai.use(sinonChai)

async = require 'async'
root = '../../../app/server/'
init = require '../../../scripts/init'
models = require(root+'models')

connect = require(root+'socketHandlers/connect')
disconnect = require(root+'socketHandlers/disconnect')

makeSocket = (user) ->
  {
    handshake:
      user: user
    join : () ->
    emit : () ->
  }

populateTests = (callback) ->
  async.series [
    (cb) -> init cb
    (cb) -> models.users.create "+13475346100", "Joel Simon", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+13107102956", "Andrew Sweet", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+19494647070", "Antonio Ono", "ios", "PHONETOKEN", cb
    (cb) -> models.users.create "+13523189733", "Russell Cullen", "android", "PHONETOKEN", cb
   ], (err, results) ->
    console.log 'done with populateTests'
    return callback err if err?
    callback null

describe 'connect', () ->

  describe 'With nothing new', () =>
    before (done) =>
      init (err) =>
        return done err if err?
        models.users.create "+13475346100", "A", "ios", "", (err, @user) =>
          return done err if err?
          @userSocket = makeSocket @user
          @userSocket.emit = sinon.spy()
          connect @userSocket, done

    it 'emits the correct thing', () =>
      data = {
        eventList: []
        guests: {  }
        me: @user
        newInvitees: {  }
        newMessages: {  }
      }
      expect(@userSocket.emit).to.be.calledWithExactly 'onLogin', data

  describe 'With a new event', () =>
    before (done) =>
      async.series [
        (cb)-> init cb
        (cb)-> models.users.create "+12345678900", "userA", "ios", "", cb
        (cb)-> models.users.create "+12345678901", "userB", "ios", "", cb
        (cb)-> models.users.create "+12345678902", "userC", "ios", "", cb
      ], (err, results) =>
        return done err if err?
        @userA = results[1][0]
        @userB = results[2][0]
        @userC = results[3][0]
        async.series [
          (cb)=> models.events.add @userB, "BEvent1", cb
          (cb)=> models.invites.add { eid: 1, inviter: @userB.uid, uid: @userB.uid, accepted: true }, cb
          (cb)=> models.invites.addList 1, @userB.uid, [@userA], cb
          (cb)=> models.events.update 1, cb
        ], (err, results) =>
          return done err if err?
          @userSocketA = makeSocket @userA
          @userSocketA.emit = sinon.spy()

          async.series [
            (cb) => connect @userSocketA, cb
            (cb) => disconnect @userSocketA, cb

            (cb) => connect @userSocketA, cb
            (cb) => disconnect @userSocketA, cb

            (cb) => models.invites.add { eid: 1, inviter: @userB.uid, uid: @userC.uid, accepted: true }, cb
            (cb) => models.events.update 1, cb
            (cb) => models.messages.addMessage 1, @userC.uid, 'hello', cb
            (cb) => models.messages.addMessage 1, @userC.uid, 'world', cb
            (cb) => connect @userSocketA, cb
            (cb) => disconnect @userSocketA, cb

            (cb) => models.events.delete 1, cb
            (cb) => connect @userSocketA, cb
            (cb) => disconnect @userSocketA, cb
          ], done


    # it 'called emit twice', () =>
    #   expect(@userSocketA.emit.callCount).to.equal 2

    it 'emits the new event on the first connect', () =>
      data = {
        eventList: [ 1 ]
        guests: {
          1 : [2]
        }
        me: @userA
        newInvitees: {
          1: [{ uid: 2, name: "userB", pn: "+12345678901"},
              { uid: 1, name: "userA", pn: "+12345678900" }]
        }
        newMessages: {}
      }
      firstCall = @userSocketA.emit.getCall(0).args
      expect(firstCall[0]).to.equal 'onLogin'
      expect(firstCall[1]).to.deep.equal.data
      # expect(firstCall[1].newInvitees).to.deep.include.members data.newInvitees

    it 'does not emit the new initees on second connect', () =>
      data = {
        eventList: [ 1 ]
        guests: {}
        me: @userA
        newInvitees: {}
        newMessages: {}
      }
      firstCall = @userSocketA.emit.getCall(1).args
      expect(firstCall[0]).to.equal 'onLogin'
      expect(firstCall[1]).to.deep.equal data

    it 'emits a new message and guest on third connect', (done) =>
      models.messages.getMoreMessages 1, 1, (err, messages) =>
        data = {
          eventList: [ 1 ]
          guests: { 1 : [2,3] }
          me: @userA
          newInvitees: { 1 : [ @userC ] }
          newMessages: { 1 : messages }
        }
        secondCall = @userSocketA.emit.getCall(2).args
        expect(secondCall[0]).to.equal 'onLogin'
        expect(secondCall[1]).to.deep.equal data
        done()

    it 'emits the right event list after an event has been ended', () =>
      data = {
        eventList: [ ]
        guests: { }
        me: @userA
        newInvitees: { }
        newMessages: { }
      }
      thirdCall = @userSocketA.emit.getCall(3).args
      expect(thirdCall[0]).to.equal 'onLogin'
      expect(thirdCall[1]).to.deep.equal data