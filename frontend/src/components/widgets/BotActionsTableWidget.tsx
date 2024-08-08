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
import { BotActionApi, GetBotActionsPaginatedResponse } from '#types/api/botActions';
import BotAction from '#components/BotAction';

import style from '#styles/widgets/TableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

const fetchBotActions = async (pagination: Pagination) => {
  const response = await makeRequest('/api/v1/botActions/', {
    schema: GetBotActionsPaginatedResponse,
    params: getSearchParams(pagination),
  });

  return response;
};

const BotActionsTableWidget: Component = () => {
  const [socket] = useSocket();
  const [session] = useSession();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(session.config.defaultPaginationLimit);
  const [actions, { mutate: setActions, refetch: refetchActions }] = createResource(createPagination(limit, page), fetchBotActions, {
    initialValue: {
      data: [],
      total: 0,
      limit: 0,
      offset: 0,
    },
    name: 'timers',
  });

  let tableRef = document.createElement('table');

  const createAction = (action: BotActionApi) => {
    setActions((filters) => ({ ...filters, data: [action, ...filters.data] }));
  };


  const handleResize = () => {
    const width = tableRef.scrollWidth;

    if (width > 1100) return setTableType(TableType.Full);
    if (width > 800) return setTableType(TableType.Compact);
    return setTableType(TableType.Mobile);
  };

  onMount(() => {
    socket.client.on('NEW_BOT_ACTION', createAction);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    socket.client.off('NEW_BOT_ACTION', createAction);

    window.removeEventListener('resize', handleResize);
  });

  // Handle resize when table data is loaded
  createEffect(() => {
    actions.state === 'ready' && handleResize();
  });

  return (
    <Widget
      title='Bot Actions'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchActions}
      loading={actions.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchActions} loading={actions.state === 'refreshing'}>Failed to load bot actions</ErrorFallback>
      }>
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => actions().total} />

        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Filters</FetchFallback>}>
          <TableContainer class={style.commandsContainer} component={Paper}>
            <Table ref={tableRef} stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Action</TableCell>
                  <TableCell align='center'>Description</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={actions().data}>
                  {(action) => (
                    <BotAction log={action} tableType={tableType()} />
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

export default BotActionsTableWidget;
