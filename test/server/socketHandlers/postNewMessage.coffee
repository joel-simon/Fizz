should = require('should')
assert = require('assert')
request = require('supertest')
async = require 'async'
root = '../../../app/server/'
init = require '../../../scripts/serverInit'
db = require(root+'adapters/db.js')


describe 'postNewMessage', ()->
  url = 'http://localhost:9001'
  before (done) ->
    init done