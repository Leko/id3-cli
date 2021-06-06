# id3-cli

![npm](https://img.shields.io/npm/v/id3-cli-batch)

CLI tool for batch editing ID3 tags of multiple MP3 files

- Batch fix garbled characters (non-UTF8 encoding) in old mp3 files
- Batch editing of meta information such as album name and artist
- Batch reassign track numbers from 1 to sequential numbers.

## Install

```
npm install -g id3-cli-batch
```

## Usage

```
Usage: id3 <pattern> [...options]

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
```

### Convert ID3 tags into UTF8

If no options are passed, the original value will be kept.

```
id3 'path/to/*' --overwrite
```

### Change album name and artists

`--artist` can take multiple values

```
id3 'path/to/*' --album 'Name' --artist 'Artist1' --artist 'Artist2' --out-dir path/to/out
```

### Set cover image

```
id3 'path/to/*' --picture 'path/to/image.jpg' --out-dir path/to/out
```

## License

This package is under [MIT license](https://github.com/Leko/id3-cli/blob/main/LICENSE).
