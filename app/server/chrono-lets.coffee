chrono = require 'chrono-node'

format = (s) ->
  s = s.replace(/halloween/i, 'October 31')
  s = s.replace(/christmas/i, 'December 25')
  s = s.replace(/night/i, '10pm')
  s = s.replace(/dinner/i, '7pm')
  s = s.replace(/breakfast/i, '9am')

chrono.parsers.ChrismasParser = (text, ref, opt) ->
  #Create a chrono's base parser
  parser = chrono.Parser text, ref, opt
  # Extend the parser with our pattern
  parser.pattern =  () -> /Christmas/i
  parser.extract = (text, index) ->
    # Chrono will find all indexes of the text that match our pattern.
    # We need to check and return the result 
    mentioned_text = text.substr(index).match(/Christmas/i)[0]
    return new chrono.ParseResult {
      referenceDate: ref
      text: mentioned_text
      index: index
      start:
        day: 25, month: 11, hour: 20, # It's 25 December
        year: ref.getFullYear() # But we aren't sure about the 'year' 
        impliedComponents: ['year'] 
    }
  parser

module.exports = 
  parseDate: (s) -> chrono.parseDate format(s)
  parse: (s) -> chrono.parse format(s)

# console.log module.exports.parseDate('tropical tuesday at brillowbox tuesday night')
# console.log module.exports.parseDate('halloween dinner')
# console.log module.exports.parse('this friday at 4')