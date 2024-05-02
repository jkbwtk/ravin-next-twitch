import { createEffect, createResource, createSignal, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { useSocket } from '#providers/SocketProvider';
import Widget from '#components/Widget';
import { makeRequest } from '#lib/fetch';
import { createPagination, getSearchParams, Pagination } from '#lib/pagination';
import { useSession } from '#providers/SessionProvider';
import ErrorFallback from '#components/ErrorFallback';
import Paginator from '#components/Paginator';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@suid/material';
import FetchFallback from '#components/FetchFallback';
import { GetPhraseFiltersPaginatedResponse } from '#types/api/filters';
import PhraseFilter from '#components/PhraseFilter';

import style from '#styles/widgets/TableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

const fetchFilters = async (pagination: Pagination) => {
  const response = await makeRequest('/api/v1/filters/phrase', {
    schema: GetPhraseFiltersPaginatedResponse,
    params: getSearchParams(pagination),
  });

  response.data.sort((a, b) => {
    if (a.id > b.id) return 1;
    if (a.id < b.id) return -1;
    return 0;
  });

  return response;
};

const PhraseFiltersTable: Component = () => {
  const [socket] = useSocket();
  const [session] = useSession();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(session.config.defaultPaginationLimit);
  const [filters, { mutate: setFilters, refetch: refetchFilters }] = createResource(createPagination(limit, page), fetchFilters, {
    initialValue: {
      data: [],
      total: 0,
      limit: 0,
      offset: 0,
    },
    name: 'timers',
  });

  let tableRef = document.createElement('table');

  // const createCommand = (timer: CommandTimerType) => {
  //   setTimers((timers) => ({ ...timers, data: [...timers.data, timer] }));
  // };

  // const updateCommand = (timer: CommandTimerType) => {
  //   setTimers((timers) => ({ ...timers, data: timers.data.map((c) => c.id === timer.id ? timer : c) }));
  // };

  // const removeCommand = (timerId: number) => {
  //   setTimers((timers) => ({ ...timers, data: timers.data.filter((timer) => timer.id !== timerId) }));
  // };

  const handleResize = () => {
    const width = tableRef.scrollWidth;

    if (width > 800) return setTableType(TableType.Full);
    if (width > 600) return setTableType(TableType.Compact);
    return setTableType(TableType.Mobile);
  };

  onMount(() => {
    // socket.client.on('NEW_COMMAND_TIMER', createCommand);
    // socket.client.on('UPD_COMMAND_TIMER', updateCommand);
    // socket.client.on('DEL_COMMAND_TIMER', removeCommand);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    // socket.client.off('NEW_COMMAND_TIMER', createCommand);
    // socket.client.off('UPD_COMMAND_TIMER', updateCommand);
    // socket.client.off('DEL_COMMAND_TIMER', removeCommand);

    window.removeEventListener('resize', handleResize);
  });

  // Handle resize when table data is loaded
  createEffect(() => {
    filters.state === 'ready' && handleResize();
  });

  return (
    <Widget
      title='Phrase Filters'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchFilters}
      loading={filters.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchFilters} loading={filters.state === 'refreshing'}>Failed to load filters</ErrorFallback>
      }>
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => filters().total} />

        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Filters</FetchFallback>}>
          <TableContainer ref={tableRef} class={style.commandsContainer} component={Paper}>
            <Table stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Phrase</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Similarity</TableCell>
                  <TableCell align='center' class={style.minWidthColumn} classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>Case Sensitive</TableCell>
                  <TableCell align='center'>Action</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Compact,
                  }}>Reason</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Enabled</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={filters().data}>
                  {(filter) => (
                    <PhraseFilter filter={filter} tableType={tableType()} />
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

export default PhraseFiltersTable;
