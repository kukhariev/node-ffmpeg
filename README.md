# @dropb/ffmpeg

[![npm](https://img.shields.io/npm/v/@dropb/ffmpeg.svg?)](https://www.npmjs.com/package/@dropb/ffmpeg)


ffmpeg wrapper

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
