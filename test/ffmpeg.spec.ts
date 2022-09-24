import { expect } from 'chai';
import * as fs from 'fs';
import { tmpdir, constants } from 'os';
import { inputFile } from '../config';
import { escapeShell, Ffmpeg, Options, parse } from '../src';

describe('input params:', () => {
  const outputFile = './test/SampleVideo "640x360 1mb.flv';
  const args = ['-y', '-i', inputFile, '-f', 'mp4', outputFile];
  const command = `-y -i '${inputFile}' -f mp4 '${outputFile}'`;

  it('should correct escape filename', () => {
    expect(escapeShell(outputFile)).to.equal('"./test/SampleVideo\\ \\"640x360\\ 1mb.flv"');
  });

  it('should parse string to array', () => {
    const parsed = parse(command);
    expect(parsed).to.be.instanceOf(Array);
    expect(parsed).to.deep.equal(args);
  });
});

describe('ffmpeg wrapper:', function () {
  this.timeout(20000);
  let ffmpeg: Ffmpeg;

  const outputFile = `${tmpdir()}/o.mp4`;
  const badArgs = ['--bad-args'];
  const args = ['-y', '-i', inputFile, '-f', 'mp4', outputFile];

  afterEach(() => fs.rmSync(outputFile, { force: true }));

  it('should complete with success', async () => {
    const opts: Options = { args };
    const res = await new Ffmpeg(opts).run();
    expect(res).to.have.property('code');
    expect(res.code).to.equal(0);
  });

  it('should apply priority', async () => {
    const opts: Options = { args, priority: constants.priority.PRIORITY_LOW };
    const res = await new Ffmpeg(opts).run();
    expect(res).to.have.property('code');
    expect(res.code).to.equal(0);
  });

  it('should gracefully exit on signal', async () => {
    ffmpeg = new Ffmpeg({ gracefullyExit: true });
    setTimeout(() => ffmpeg.cancel(), 100);
    const res = await ffmpeg.run(args);
    expect(res).to.have.property('code');
  });

  it('should support pause/continue signal', async () => {
    // FIXME: Windows does not support SIGSTOP and SIGCONT signals
    if (process.platform === 'win32') {
      return;
    }
    ffmpeg = new Ffmpeg();
    setTimeout(() => ffmpeg.kill('SIGSTOP'), 100); // SIGSTOP are impossible to catch
    setTimeout(() => ffmpeg.kill('SIGCONT'), 1000);
    const res = await ffmpeg.run(args);
    expect(res.code).to.equal(0);
  });

  it('should emit progress', async () => {
    ffmpeg = new Ffmpeg();
    await ffmpeg.onProgress((progress: object) => {
      expect(progress).keys([
        'frame',
        'fps',
        'q',
        'size',
        'time',
        'time_ms',
        'bitrate',
        'speed',
        'percentage',
        'remaining',
      ]);
    }).run(args);
  });

  it('should throw on error', async () => {
    ffmpeg = new Ffmpeg();
    await ffmpeg
      .run(badArgs)
      .then(() => {
        throw new Error('Was not supposed to resolve!');
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(Error);
      });
  });

  it('should throw on signal', async () => {
    ffmpeg = new Ffmpeg();
    setTimeout(() => ffmpeg.kill('SIGINT'), 100);
    await ffmpeg
      .run(args)
      .then(() => {
        throw new Error('Was not supposed to resolve!');
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(ffmpeg.killSignal).to.equal('SIGINT');
      });
  });
  // FIXME: Require nodejs >=16

  // it('should support AbortController', async () => {
  //   const controller = new AbortController();
  //   ffmpeg = new Ffmpeg({ signal: controller.signal });
  //   setTimeout(() => controller.abort(), 100);
  //   await ffmpeg
  //     .run(args)
  //     .then(() => {
  //       throw new Error('Was not supposed to resolve!');
  //     })
  //     .catch((err) => {
  //       expect(err).to.be.an.instanceof(Error);
  //       expect(err.message).to.equal('The operation was aborted');
  //     });
  // });

});
