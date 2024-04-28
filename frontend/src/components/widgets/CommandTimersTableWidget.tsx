import { createEffect, createResource, createSignal, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { CommandTimer as CommandTimerType, GetCommandTimersPaginatedResponse } from '#types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import Widget from '#components/Widget';
import CommandTimer from '#components/CommandTimer';
import { makeRequest } from '#lib/fetch';
import { createPagination, getSearchParams, Pagination } from '#lib/pagination';
import { useSession } from '#providers/SessionProvider';
import ErrorFallback from '#components/ErrorFallback';
import Paginator from '#components/Paginator';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@suid/material';
import FetchFallback from '#components/FetchFallback';

import style from '#styles/widgets/TableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

const fetchTimers = async (pagination: Pagination) => {
  const response = await makeRequest('/api/v1/commands/timers', {
    schema: GetCommandTimersPaginatedResponse,
    params: getSearchParams(pagination),
  });

  response.data.sort((a, b) => {
    if (a.id > b.id) return 1;
    if (a.id < b.id) return -1;
    return 0;
  });

  return response;
};

const CommandTimersTable: Component = () => {
  const [socket] = useSocket();
  const [session] = useSession();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(session.config.defaultPaginationLimit);
  const [timers, { mutate: setTimers, refetch: refetchTimers }] = createResource(createPagination(limit, page), fetchTimers, {
    initialValue: {
      data: [],
      total: 0,
      limit: 0,
      offset: 0,
    },
    name: 'timers',
  });

  let tableRef = document.createElement('table');

  const createCommand = (timer: CommandTimerType) => {
    setTimers((timers) => ({ ...timers, data: [...timers.data, timer] }));
  };

  const updateCommand = (timer: CommandTimerType) => {
    setTimers((timers) => ({ ...timers, data: timers.data.map((c) => c.id === timer.id ? timer : c) }));
  };

  const removeCommand = (timerId: number) => {
    setTimers((timers) => ({ ...timers, data: timers.data.filter((timer) => timer.id !== timerId) }));
  };

  const handleResize = () => {
    const width = tableRef.scrollWidth;

    if (width > 800) return setTableType(TableType.Full);
    if (width > 600) return setTableType(TableType.Compact);
    return setTableType(TableType.Mobile);
  };

  onMount(() => {
    socket.client.on('NEW_COMMAND_TIMER', createCommand);
    socket.client.on('UPD_COMMAND_TIMER', updateCommand);
    socket.client.on('DEL_COMMAND_TIMER', removeCommand);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    socket.client.off('NEW_COMMAND_TIMER', createCommand);
    socket.client.off('UPD_COMMAND_TIMER', updateCommand);
    socket.client.off('DEL_COMMAND_TIMER', removeCommand);

    window.removeEventListener('resize', handleResize);
  });

  // Handle resize when table data is loaded
  createEffect(() => {
    timers.state === 'ready' && handleResize();
  });

  return (
    <Widget
      title='Command Timers'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchTimers}
      loading={timers.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchTimers} loading={timers.state === 'refreshing'}>Failed to load commands</ErrorFallback>
      }>
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => timers().total} />

        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Commands</FetchFallback>}>
          <TableContainer ref={tableRef} class={style.commandsContainer} component={Paper}>
            <Table stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Name</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>Alias</TableCell>
                  <TableCell align='center'>Template</TableCell>
                  <TableCell align='center'>Cron</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Compact,
                  }}>Lines</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Enabled</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={timers().data}>
                  {(timer) => (
                    <CommandTimer timer={timer} tableType={tableType()} />
                  )}
                </For>
              </TableBody>
            </Table>
          </TableContainer>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default CommandTimersTable;
