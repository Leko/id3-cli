#!/usr/bin/env node
const os = require('os')
const { parse, getHelpText } = require('./options')
const { transformByPattern } = require('./transform')

async function main(_options) {
  const { help, ...options } = _options
  if (help) {
    console.error(getHelpText())
    return
  }

  const [_pattern] = process.argv.slice(2)
  const pattern = _pattern?.replace('~', os.homedir())
  await transformByPattern(pattern, options)
}

main(parse()).catch((e) => {
  console.log({ e })
  console.error(getHelpText(e))
  process.exit(1)
})
