import { FFMpegProgress, FFMpegProgressEvent } from '@dropb/ffmpeg-progress';
import { ChildProcess, spawn } from 'child_process';
import { noop, parse } from './utils';
import { setPriority } from 'os';

export type ExitEvent = {
  code: number | null;
  message?: string | null;
  signal?: string | number | null;
};

export interface Options {
  args?: string[] | string;
  onProgress?: (evt: FFMpegProgressEvent) => void;
  gracefullyExit?: boolean;
  priority?: number;
  timeout?: number;
  // /**
  //  * @internal
  //  * Require nodejs >=16
  //  */
  // signal?: AbortSignal;
}

const controlSignals = ['SIGSTOP', 'SIGCONT', 18, 19];

/**
 * @todo Write the documentation.
 */
export class Ffmpeg {
  process?: ChildProcess;
  readonly killSignal?: NodeJS.Signals | number;
  private onProgressCallback: (evt: FFMpegProgressEvent) => void = noop;
  private _args: string[] = [];

  constructor(public options: Options = {}) {
    this.onProgressCallback = options.onProgress || noop;
    if (options.args) {
      this._args = typeof options.args === 'string' ? parse(options.args) : options.args;
    }
  }

  onProgress(cb: (evt: FFMpegProgressEvent) => void): Ffmpeg {
    this.onProgressCallback = cb;
    return this;
  }

  setPriority(priority = 0): Ffmpeg {
    if (this.process?.pid) {
      setPriority(this.process.pid, priority);
    } else {
      this.options.priority = priority;
    }
    return this;
  }

  kill(signal: NodeJS.Signals = 'SIGKILL'): Ffmpeg {
    if (this.process?.pid) {
      this.process.kill(signal);
      if (!controlSignals.includes(signal)) {
        (this.killSignal as any) = signal;
      }
      return this;
    }
    throw new Error('No process running');
  }

  cancel(signal?: NodeJS.Signals): Ffmpeg {
    return this.kill(signal);
  }

  run(args?: string[] | string): Promise<ExitEvent> {
    return new Promise((resolve, reject) => {
      const progressPipe = new FFMpegProgress();
      if (args) {
        this._args = typeof args === 'string' ? parse(args) : args;
      }

      this.process = spawn(process.env.FFMPEG_PATH || process.env.FFMPEG_BIN || 'ffmpeg', this._args, {
        windowsHide: true,
        timeout: this.options.timeout || 0,
        // signal: this.options.signal, // nodejs >=16
      });

      this.process.on('error', reject);

      this.process.on('close', (code, signal) => {
        if (code === 0) {
          resolve({ code, signal, message: 'ok' });
        } else if (this.options.gracefullyExit && this.killSignal) {
          resolve({ code, signal: signal || this.killSignal, message: progressPipe.exitMessage });
        } else {
          reject(new Error(progressPipe.exitMessage || 'Unknown Error'));
        }
      });

      this.process.stderr?.pipe(progressPipe).on('data', (progressData: FfmpegProgressEvent) => {
        this.onProgressCallback(progressData);
      });

      if (this.options.priority !== undefined) {
        this.setPriority(this.options.priority);
      }
    });
  }
}

export function createFfmpeg(options: Options = {}): Ffmpeg {
  return new Ffmpeg(options);
}
