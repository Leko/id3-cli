const fs = require('fs')
const arg = require('arg')

exports.parse = function parse() {
  const args = arg({
    '--title': String,
    '--artist': [String],
    '--album': String,
    '--track': Number,
    '--increment-track': Boolean,
    '--genre': String,
    '--picture': String,
    '--overwrite': Boolean,
    '--out-dir': String,
  })
  if (!args['--overwrite'] && !args['--out-dir']) {
    throw new Error(`Either --overwrite or --out-dir is required`)
  }
  return args
}
