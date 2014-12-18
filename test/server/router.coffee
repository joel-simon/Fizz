chai = require("chai")
sinon = require("sinon")
sinonChai = require("sinon-chai")
expect = chai.expect
chai.use(sinonChai)

request = require('supertest')
async = require('async')

init = require('../../scripts/init')
root = '../../app/server/'
db = require(root+'adapters/db.js')

output = require(root+'output')

socketURL = 'http://localhost:9001';

describe 'Routing', ()->
  url = 'http://localhost:9001'
  before (done) ->
    init done

  describe 'Registration', () ->
    path = '/registration'
    body =
      firstName: 'Joel',
      lastName: 'Simon',
      platform: 'ios',
      pn: '+13475346100',
      phoneToken: 'myToken'
    
    beforeEach (done) ->
      db.query "truncate table users cascade", done

    describe 'Should return error on missing body params', () ->
      beforeEach () ->
        this.cloned = JSON.parse(JSON.stringify(body))
      it 'checks for no firstName', (done) ->        
        delete @cloned.firstName
        request(url).post(path).send(@cloned).expect(400).end(done)
      it 'checks for no lastName', (done) ->        
        delete @cloned.lastName
        request(url).post(path).send(@cloned).expect(400).end(done)
      it 'checks for no platform', (done) ->        
        delete @cloned.platform
        request(url).post(path).send(@cloned).expect(400).end(done)

    describe 'Should register a user with valid input', () ->
      it 'registers with no error', (done) ->
        request(url).post(path).send(body).expect(200).end(done)
      describe 'creates user in database', () ->
        before (done) ->
          query = "SELECT * FROM users WHERE pn = $1"
          db.query query, [body.pn], (err, results) =>
            return done err if err?
            @user = results.rows[0] 
            done null
        it 'has the correct name', () ->
          (@user.name).should.equal(body.firstName+' '+body.lastName)
        it 'has the correct pn', () ->
          (@user.pn).should.equal(body.pn)
        it 'has the correct platform', () ->
          (@user.platform).should.equal(body.platform)
        it 'has the correct token', () ->
          (@user.phoneToken).should.equal(body.phoneToken)
    
    # describe 'On repeated registration from same number', (done) ->
    #   it 'resets the password', (done) =>
    #     request(url).post(path).send(body).expect(200).end ()->
    #       query = "SELECT password FROM users WHERE pn = $1"
    #       db.query query, [body.pn], (err, results) =>
    #         return done err if err?
    #         first = results.rows[0].password
    #         request(url).post(path).send(body).expect(200).end ()->
    #           db.query query, [body.pn], (err, results) =>
    #             return done err if err?
    #             second = results.rows[0].password
    #             expect(first).to.not.equal second
    #             done()

  describe 'Login', ()->
    path = '/login'
    before (done) =>
      body =
        firstName: 'Joel',
        lastName: 'Simon',
        platform: 'ios',
        pn: '+13475346100',
        phoneToken: 'myToken'
      request(url).post('/registration').send(body).expect(200).end (err) =>
        return done err if err?
        db.query "SELECT * FROM users LIMIT 1", [], (err, results) =>
          return done err if err?
          @user = results.rows[0]
          done null

    # it 'asdas', (done) =>
    #   body = 
    #     pn : @user.pn
    #     phoneToken : @user.phoneToken
    #     password : @user.password
    #     appVersion : "0.0.0"
    #   request(url).post(path).send(body).expect(200).end (err, res)-> 
    #     return done err if err?
    #     socket = require('socket.io-client')('http://localhost:9001')
    #     socket.on 'connect', (data) ->
    #       console.log 'conect', data
    #       done err

          # client1.emit('connection name', chatUser1);
        