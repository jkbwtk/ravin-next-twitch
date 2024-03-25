import { logger } from '#lib/logger';
import { readdirSync } from 'fs';
import { z } from 'zod';

export const JobTriggers = z.enum(['startup', 'shutdown']);

export type JobTriggers = z.infer<typeof JobTriggers>;


export const Job = z.object({
  name: z.string(),
  description: z.string(),
  trigger: JobTriggers,
  run: z.function(),
});

export type Job = z.infer<typeof Job>;

let jobs: Job[] | null = null;


export const loadJobs = async (): Promise<Job[]> => {
  const jobs: Job[] = [];
  const jobFiles = readdirSync(__dirname)
    .filter((file) =>
      file !== 'job.ts' &&
      file !== 'job.js' &&
      file.match(/^.+\.d\.ts$/) === null &&
      file.match(/^.+\.(t|j)s$/),
    );

  for (const file of jobFiles) {
    try {
      const job = await import(`./${file}`);
      jobs.push(Job.parse(job.default));
    } catch (err) {
      logger.error('Failed to load job [%s]', file, { error: err, label: ['Jobs', 'loadJobs'] });
    }
  }

  return jobs;
};

export const reloadJobs = async (): Promise<void> => {
  jobs = await loadJobs();
};

export const runJobs = async (trigger: JobTriggers): Promise<void> => {
  if (!jobs) {
    jobs = await loadJobs();
  }

  for (const job of jobs.filter((job) => job.trigger === trigger)) {
    try {
      logger.info('Running job [%s], trigger [%s]', job.name, trigger, { label: ['Jobs', 'runJobs'] });
      await job.run();
      logger.info('Job [%s] completed', job.name, { label: ['Jobs', 'runJobs'] });
    } catch (err) {
      logger.warn('Failed to run job [%s]', job.name, { error: err, label: ['Jobs', 'runJobs'] });
    }
  }
};
