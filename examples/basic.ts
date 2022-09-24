import { createFfmpeg } from '../src';
import { inputFile, outputFile } from '../config';

const ffmpeg = createFfmpeg();

ffmpeg
  .onProgress(console.info)
  .run(`-y -re -i ${inputFile} -f mp4 ${outputFile}`)
  .catch(console.error)
  .then(console.info);
