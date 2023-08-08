import { LoggerOutput } from '#lib/logger/outputs/LoggerOutput';
import { LoggerOptions, OutputOptions, TransformableEntry } from '#lib/logger/types';
import { getFormattedTime } from '#lib/timeLib';
import { Dirent, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { FileHandle, open } from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration, { Duration } from 'dayjs/plugin/duration';
import { Assembler } from '#lib/Assembler';
import { mergeOptions } from '#shared/utils';


dayjs.extend(duration);
dayjs.extend(relativeTime);

type FileOutputOptions = OutputOptions & {
  directory?: string;
  filename: string;
  rotationFormat?: (() => string) | false;
  maxAge?: Duration | false;
  maxFiles?: number | false;
  cleanupInterval?: Duration;
};

type OpenFile = {
  handle: FileHandle;
  path: string;
};

type WriteResult = {
  bytesWritten: number;
  buffer: string | Uint8Array;
};

export class FileOutput extends LoggerOutput {
  public static duration = dayjs.duration;

  private openFile: OpenFile | null = null;
  private lastCleanup = 0;

  static defaultOptions: Required<FileOutputOptions> & {
    extension: string;
    basename: string;
  } = {
      format: new Assembler(),
      level: 0,
      directory: 'logs',
      filename: 'stdout.log',
      rotationFormat: false,
      cleanupInterval: dayjs.duration({ hours: 1 }),
      maxAge: false,
      maxFiles: false,
      extension: 'NOT UPDATED',
      basename: 'NOT UPDATED',
    };

  protected options: typeof FileOutput.defaultOptions;

  constructor(options: FileOutputOptions) {
    super();
    this.options = mergeOptions(options, FileOutput.defaultOptions);

    this.options.extension = path.extname(this.options.filename);
    this.options.basename = path.basename(this.options.filename, this.options.extension);

    this.createDirectory();
  }


  public log(context: LoggerOptions, entry: TransformableEntry): void {
    if (!this.canLog(context, entry)) return;

    const copy = { ...entry };
    const result = this.options.format.assemble(copy, context);

    if (result === null) return;

    this.write(result);
  }

  public close(): Promise<void> {
    if (this.openFile === null) return Promise.resolve();

    return this.openFile.handle.close();
  }

  private getFilePath(): string {
    const fullName = [
      this.options.basename,
      this.options.rotationFormat ? this.options.rotationFormat() : '',
      this.options.extension,
    ].join('');

    return path.join(
      this.options.directory,
      fullName,
    );
  }

  private async getFiles(): Promise<{ dirent: Dirent, path: string }[]> {
    const files = await readdirSync(this.options.directory, { withFileTypes: true });

    return files.filter((file) =>
      file.isFile() &&
      file.name.startsWith(this.options.basename) &&
      file.name.endsWith(this.options.extension),
    ).map((file) => ({
      dirent: file,
      path: path.join(this.options.directory, file.name),
    }));
  }

  public static rotateDate(): string {
    return `_${getFormattedTime('YY-MM-DD')}`;
  }

  private createDirectory(): void {
    const dir = this.options.directory;

    if (existsSync(dir)) return;

    mkdirSync(dir, { recursive: true });
  }

  private async openOrCreateFile(): Promise<OpenFile> {
    const path = this.getFilePath();

    return {
      path: path,
      handle: await open(path, 'a'),
    };
  }

  private async periodicCleanup(): Promise<void> {
    const now = dayjs();

    const diff = now.diff(this.lastCleanup, 'ms');

    if (diff > this.options.cleanupInterval.asMilliseconds()) {
      await this.runCleanup();
      this.lastCleanup = now.valueOf();
    }
  }

  private async runCleanup(): Promise<void> {
    const files = await this.getFiles();
    const details = files
      .map((file) => ({
        ...file,
        stats: statSync(file.path),
      }))
      .sort((a, b) => a.stats.birthtimeMs - b.stats.birthtimeMs);


    if (this.options.maxAge !== false) {
      const cutoff = dayjs().subtract(this.options.maxAge);

      for (const detail of details) {
        if (dayjs(detail.stats.birthtime).isBefore(cutoff)) {
          unlinkSync(detail.path);
        }
      }
    }

    if (this.options.maxFiles !== false) {
      const cutoff = details.length - this.options.maxFiles;

      if (cutoff > 0) {
        for (const detail of details.slice(0, cutoff)) {
          unlinkSync(detail.path);
        }
      }
    }
  }

  private async write(message: string): Promise<WriteResult> {
    const newFilePath = this.getFilePath();

    if (this.openFile === null) {
      this.openFile = await this.openOrCreateFile();
    }

    if (newFilePath !== this.openFile.path) {
      await this.openFile.handle.close();
      this.openFile = await this.openOrCreateFile();
    }

    await this.periodicCleanup();

    const buffer = Buffer.from(message + '\n');

    return this.openFile.handle.write(buffer);
  }
}
