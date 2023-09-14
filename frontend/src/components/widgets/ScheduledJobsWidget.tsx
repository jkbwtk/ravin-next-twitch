import { createResource, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import FetchFallback from '#components/FetchFallback';
import Widget from '#components/Widget';
import { GetScheduledJobsResponse, ScheduledJob } from '#shared/types/api/admin';
import { useSocket } from '#providers/SocketProvider';
import ScheduledCronJob from '#components/ScheduledCronJob';

import style from '#styles/widgets/ScheduledJobsWidget.module.scss';


const sortJobs = (a: ScheduledJob, b: ScheduledJob) => {
  if (a.creationTimestamp > b.creationTimestamp) return 1;
  else if (a.creationTimestamp < b.creationTimestamp) return -1;
  else return 0;
};

const fetchChantingSettings = async (): Promise<ScheduledJob[]> => {
  const response = await fetch('/api/v1/admin/scheduled-jobs');
  const { data } = await response.json() as GetScheduledJobsResponse;

  return data.sort(sortJobs);
};

const ScheduledJobsWidget: Component = () => {
  const [socket] = useSocket();
  const [jobs, { mutate: mutateJobs }] = createResource(fetchChantingSettings, { initialValue: [] });
  const [timer, setTimer] = createSignal(Date.now());

  const handleJobCreation = (job: ScheduledJob) => {
    mutateJobs((oldJobs) => {
      return [...oldJobs, job].sort(sortJobs);
    });
  };

  const handleJobUpdate = (job: ScheduledJob) => {
    mutateJobs((oldJobs) => {
      return oldJobs
        .map((oldJob) => {
          if (oldJob.creationTimestamp !== job.creationTimestamp) return oldJob;
          else return job;
        });
    });
  };

  const handleJobDeletion = (creationTimestamp: number) => {
    mutateJobs((oldJobs) => {
      return oldJobs.filter((oldJob) => oldJob.creationTimestamp !== creationTimestamp);
    });
  };

  let intervalHandle: undefined | number = undefined;


  onMount(() => {
    socket.client.on('NEW_CRON_JOB', handleJobCreation);
    socket.client.on('UPD_CRON_JOB', handleJobUpdate);
    socket.client.on('DEL_CRON_JOB', handleJobDeletion);

    onMount(() => {
      intervalHandle = setInterval(() => {
        setTimer(Date.now());
      }, 1000) as unknown as number;
    });
  });

  onCleanup(() => {
    socket.client.off('NEW_CRON_JOB', handleJobCreation);
    socket.client.off('UPD_CRON_JOB', handleJobUpdate);
    socket.client.off('DEL_CRON_JOB', handleJobDeletion);

    if (intervalHandle) {
      clearInterval(intervalHandle);
    }
  });

  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Scheduled Jobs'>
      <Show
        when={jobs.state === 'ready' || jobs.state === 'refreshing'}
        fallback={<FetchFallback>Fetching Scheduled Jobs</FetchFallback>}
      >
        <For each={jobs()}>
          {(job) => (<ScheduledCronJob {...job} timer={timer()} />)}
        </For>
      </Show>
    </Widget>
  );
};

export default ScheduledJobsWidget;
