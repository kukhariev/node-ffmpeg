# @dropb/ffmpeg

[![npm version][npm-image]][npm-url] [![Build status][gha-image]][gha-url]
[![commits since latest release][comm-image]][comm-url]

Simple node.js wrapper for FFmpeg

## Install

```sh
npm install @dropb/ffmpeg
```

## Usage

```js
// optional: specify the binary path
process.env.FFMPEG_PATH = '/usr/bin/ffmpeg';


const ffmpeg = new Ffmpeg({
  onProgress: console.info,
});

ffmpeg
  .run(['-i', 'input.flv', '-f', 'mp4', 'output.mp4'])
  .catch(console.error);
  .then(console.info)


```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@dropb/ffmpeg.svg
[npm-url]: https://www.npmjs.com/package/@dropb/ffmpeg
[gha-image]: https://github.com/kukhariev/node-ffmpeg/workflows/CI/badge.svg
[gha-url]: https://github.com/kukhariev/node-ffmpeg/actions
[comm-image]: https://img.shields.io/github/commits-since/kukhariev/node-ffmpeg/latest
[comm-url]: https://github.com/kukhariev/node-ffmpeg/releases/latest
