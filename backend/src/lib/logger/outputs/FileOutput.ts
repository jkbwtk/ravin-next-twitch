import { LoggerOutput } from '#lib/logger/outputs/LoggerOutput';
import { LoggerOptions, OutputOptions, TransformableEntry } from '#lib/logger/types';
import { getFormattedTime } from '#lib/timeLib';
import { closeSync, Dirent, existsSync, mkdirSync, openSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration, { Duration } from 'dayjs/plugin/duration';
import { mergeOptions, RequiredDefaults } from '#shared/utils';


dayjs.extend(duration);
dayjs.extend(relativeTime);

interface RotationFormat {
  generate(): string;
  getDate(filename: string): Dayjs | null;
}

type FileOutputOptions = OutputOptions & ({
  directory?: string;
  filename: string;
  rotationFormat?: false;
  maxAge?: false;
  maxFiles?: false;
  cleanupInterval?: Duration;
} | {
  directory?: string;
  filename: string;
  rotationFormat?: RotationFormat;
  maxAge?: Duration | false;
  maxFiles?: false;
  cleanupInterval?: Duration;
} | {
  directory?: string;
  filename: string;
  rotationFormat?: RotationFormat;
  maxAge?: false;
  maxFiles?: number | false;
  cleanupInterval?: Duration;
});

type OpenFile = {
  fileDescriptor: number;
  path: string;
};

export class FileOutput extends LoggerOutput {
  public static duration = dayjs.duration;

  private openFile: OpenFile | null = null;
  private lastCleanup = 0;

  private extension: string;
  private basename: string;

  static defaultOptions: RequiredDefaults<FileOutputOptions> = {
    directory: 'logs',
    rotationFormat: false,
    cleanupInterval: dayjs.duration({ hours: 1 }),
    maxAge: false,
    maxFiles: false,
  };

  protected options: Required<FileOutputOptions>;

  public static basicRotationFormat: RotationFormat = {
    generate: (): string => {
      return `_${getFormattedTime('YY-MM-DD')}`;
    },
    getDate: (filename: string): Dayjs | null => {
      const match = filename.match(/_(\d{4}-\d{2}-\d{2})/);

      if (match === null) return null;

      return dayjs(match[1], 'YY-MM-DD');
    },
  };

  constructor(options: FileOutputOptions) {
    super();
    this.options = mergeOptions(options, FileOutput.defaultOptions);

    this.extension = path.extname(this.options.filename);
    this.basename = path.basename(this.options.filename, this.extension);

    this.createDirectory();

    if (this.options.rotationFormat === false && (
      this.options.maxAge !== false ||
      this.options.maxFiles !== false
    )) {
      throw new Error('Cannot set maxAge or maxFiles without a rotationFormat');
    }
  }


  public log(context: LoggerOptions, entry: TransformableEntry): void {
    if (!this.canLog(context, entry)) return;

    const copy = { ...entry };
    const result = this.options.format.assemble(copy, context);

    if (result === null) return;

    this.write(result);
  }

  public async close(): Promise<void> {
    this.closeFile();
  }

  private getFilePath(): string {
    const fullName = [
      this.basename,
      this.options.rotationFormat ? this.options.rotationFormat.generate() : '',
      this.extension,
    ].join('');

    return path.join(
      this.options.directory,
      fullName,
    );
  }

  private getFiles(): { dirent: Dirent, path: string }[] {
    const files = readdirSync(this.options.directory, { withFileTypes: true });

    return files.filter((file) =>
      file.isFile() &&
      file.name.startsWith(this.basename) &&
      file.name.endsWith(this.extension),
    ).map((file) => ({
      dirent: file,
      path: path.join(this.options.directory, file.name),
    }));
  }

  private createDirectory(): void {
    const dir = this.options.directory;

    if (existsSync(dir)) return;

    mkdirSync(dir, { recursive: true });
  }

  private openOrCreateFile(): OpenFile {
    const path = this.getFilePath();
    const handle = openSync(path, 'a');

    return {
      path,
      fileDescriptor: handle,
    };
  }

  private closeFile(): void {
    if (this.openFile === null) return;

    closeSync(this.openFile.fileDescriptor);
    this.openFile = null;
  }

  private async periodicCleanup(): Promise<void> {
    const now = dayjs();

    const diff = now.diff(this.lastCleanup, 'ms');

    if (diff > this.options.cleanupInterval.asMilliseconds()) {
      await this.runCleanup();
      this.lastCleanup = now.valueOf();
    }
  }

  private runCleanup(): void {
    const rotationFormat = this.options.rotationFormat;
    if (rotationFormat === false) return;

    const files = this.getFiles();
    const details = files
      .map((file) => ({
        ...file,
        date: rotationFormat.getDate(file.dirent.name),
      }))
      .filter((file) => file.date !== null || file.path === this.openFile?.path)
      .sort((a, b) => a.date?.diff(b.date) ?? 0) as { dirent: Dirent, path: string, date: Dayjs }[];


    if (this.options.maxAge !== false) {
      const cutoff = dayjs().subtract(this.options.maxAge);

      for (const detail of details) {
        if (detail.date.isBefore(cutoff)) {
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

  private write(message: string): void {
    const newFilePath = this.getFilePath();

    if (this.openFile === null) {
      this.openFile = this.openOrCreateFile();
    }

    if (newFilePath !== this.openFile.path) {
      this.closeFile();
      this.openFile = this.openOrCreateFile();
    }

    this.periodicCleanup();

    const buffer = Buffer.from(message + '\n');

    writeFileSync(this.openFile.fileDescriptor, buffer);
  }
}
