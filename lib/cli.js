#!/usr/bin/env node
const os = require('os')
const path = require('path')
const fs = require('fs/promises')
const glob = require('glob')
const ID3Writer = require('browser-id3-writer')
const jsmediatags = require('jsmediatags')
const EncodingJa = require('encoding-japanese')
const { parse } = require('./options')

function toUTF8(str) {
  return EncodingJa.convert(str, {
    from: 'AUTO',
    to: 'UNICODE',
    type: 'string',
  })
}

function readTags(filePath) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(filePath, {
      onSuccess: resolve,
      onError: reject,
    })
  })
}

const [_pattern] = process.argv.slice(2)
const pattern = _pattern.replace('~', os.homedir())

const files = glob
  .sync(pattern, { absolute: true })
  .filter((filePath) => path.extname(filePath) === '.mp3')

async function main(options) {
  await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      tags: await readTags(filePath),
    }))
  ).then(async (files) => {
    let autoTrack = 1
    for (const f of files) {
      if (f.tags.type !== 'ID3') {
        continue
      }
      const title = options['--title'] ?? f.tags.tags.title
      const artist = options['--artist'] ?? f.tags.tags.artist
      const album = options['--album'] ?? f.tags.tags.album
      const track =
        (options['--increment-track'] ? autoTrack++ : options['--track']) ??
        f.tags.tags.track
      const genre = options['--genre'] ?? f.tags.tags.genre
      const picture = options['--picture'] ?? f.tags.tags.picture
      let writer = new ID3Writer(await fs.readFile(f.filePath))
        .setFrame('TIT2', toUTF8(title))
        .setFrame(
          'TPE1',
          (Array.isArray(artist) ? artist : [artist]).map(toUTF8)
        )
        .setFrame('TALB', toUTF8(album))
        .setFrame('TRCK', toUTF8(`${track}/${files.length}`))
        .setFrame('TCON', [genre].map(toUTF8))
      if (picture) {
        writer = writer.setFrame('APIC', {
          type: 3,
          data: await fs.readFile(picture),
          description: '',
        })
      }
      writer.addTag()

      const outPath = options['--overwrite']
        ? f.filePath
        : path.join(options['--out-dir'], path.basename(f.filePath))
      const outDir = path.dirname(outPath)
      await fs.mkdir(outDir, { recursive: true })
      await fs.writeFile(outPath, Buffer.from(writer.arrayBuffer))

      console.log(`DONE ${f.filePath} -> ${outPath}`)
    }
  })
}

main(parse()).catch((e) => {
  console.error(e.stack)
  process.exit(1)
})
