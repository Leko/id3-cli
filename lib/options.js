const fs = require('fs')
const arg = require('arg')

const helpText = `Usage: id3 <pattern> [...options]

Arguments:
  pattern: A glob pattern to specify the target file

ID3 options:
  --title           song title (TIT2)
  --artist          song artists (TPE1)
  --album           album title (TALB)
  --track           song number in album (TRCK)
  --genre           song genres (TCON)
  --picture         attached picture (APIC)
  --increment-track set a sequential number from 1 to the songs you specified. The order is ascending by file name

Output options: either one is required
  --overwrite       overwrite the original file
  --out-dir         output files to the specified directory

Other options:
  --help            show this help
`

exports.showHelp = function showHelp(message = '') {
  const prefix = message ? message + '\n\n' : ''
  console.error(prefix + helpText)
}

exports.parse = function parse() {
  const args = arg({
    '--help': Boolean,
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
  return args
}
