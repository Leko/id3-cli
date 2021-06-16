#!/usr/bin/env node
const path = require('path')
const fs = require('fs/promises')
const glob = require('glob')
const ID3Writer = require('browser-id3-writer')
const jsmediatags = require('jsmediatags')
const EncodingJa = require('encoding-japanese')

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

async function transform(filePath, options, autoTrack, numAudiosInAlbum) {
  const tags = await readTags(filePath)
  if (tags.type !== 'ID3') {
    throw new Error(`Invalid tag type: ${tags.type}`)
  }

  const title = options.title ?? tags.tags.title
  const artist = options.artist ?? tags.tags.artist
  const album = options.album ?? tags.tags.album
  const track =
    (options.incrementTrack ? autoTrack++ : options.track) ?? tags.tags.track
  const genre = options.genre ?? tags.tags.genre
  const picture = options.picture ?? tags.tags.picture
  let writer = new ID3Writer(await fs.readFile(filePath))
    .setFrame('TIT2', toUTF8(title))
    .setFrame('TPE1', (Array.isArray(artist) ? artist : [artist]).map(toUTF8))
    .setFrame('TALB', toUTF8(album))
    .setFrame('TRCK', toUTF8(`${track}/${numAudiosInAlbum}`))
    .setFrame('TCON', [genre].map(toUTF8))
  if (picture) {
    writer = writer.setFrame('APIC', {
      type: 3,
      data: await fs.readFile(picture),
      description: '',
    })
  }
  writer.addTag()

  const outPath = options.overwrite
    ? filePath
    : path.join(options.outDir, path.basename(filePath))
  const outDir = path.dirname(outPath)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outPath, Buffer.from(writer.arrayBuffer))

  return outPath
}

function transformByPattern(pattern, options) {
  if (!pattern) {
    throw new Error('The first argument pattern is required')
  }
  if (!options.overwrite && !options.outDir) {
    throw new Error('Either overwrite or outDir is required')
  }

  const files = glob
    .sync(pattern, { absolute: true })
    .filter((filePath) => path.extname(filePath) === '.mp3')

  return Promise.all(
    files.map((filePath, i) => transform(filePath, options, i))
  )
}

exports.transformByPattern = transformByPattern
