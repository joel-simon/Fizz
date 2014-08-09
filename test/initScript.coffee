init = require './init'

init (err, results) ->
  if (err)
    console.log 'Error in init', err
    process.exit(1)
  else
    console.log 'DataBase has been initialized.'
    process.exit(0)