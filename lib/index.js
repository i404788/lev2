const completion = require('./completion')
const history = require('./history')
const createREPL = require('./repl')
const getDB = require('./db')
const locate = require('./location')
const cache = require('./cache')
const cli = require('./cli')

module.exports = function (args) {
  //
  // find where the location by examining the arguments
  // and create an instance to work with.
  //
  locate(args, (err, dbParams) => {
    if (err) {
      console.error(err)
      return process.exit(1)
    }
    init(args, dbParams)
  })
}

function init (args, dbParams) {
  const db = getDB(args, dbParams)

  //
  // if any of these commands are specified as arguments
  // than the program should not be run in REPL mode.
  //
  const cliCommands = [
    'keys', 'values', 'get', 'match', 'put', 'del',
    'all', 'batch', 'length', 'start', 'end', 'limit', 'map'
  ]

  const cliMode = Object.keys(args).some(cmd => {
    return cliCommands.indexOf(cmd) > -1
  })

  process._cliMode = cliMode

  if (cliMode) return cli(db, args)

  //
  // create the instance of the repl and start it.
  //
  const repl = createREPL(db, args, cache)

  history(repl, args)
  completion(repl, cache)
}
