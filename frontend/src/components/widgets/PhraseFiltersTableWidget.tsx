import { batch, createEffect, createResource, createSignal, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { useSocket } from '#providers/SocketProvider';
import Widget from '#components/Widget';
import { makeRequest } from '#lib/fetch';
import { createPagination, getSearchParams, Pagination } from '#lib/pagination';
import { useSession } from '#providers/SessionProvider';
import ErrorFallback from '#components/ErrorFallback';
import Paginator from '#components/Paginator';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@suid/material';
import FetchFallback from '#components/FetchFallback';
import { GetPhraseFiltersPaginatedResponse, PhraseFilterApi } from '#types/api/filters';
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

  const createFilter = () => {
    refetchFilters();
  };

  const updateFilter = (filter: PhraseFilterApi) => {
    setFilters((filters) => ({ ...filters, data: filters.data.map((f) => f.id === filter.id ? filter : f) }));
  };

  const removeFilter = (filterId: number) => {
    batch(() => {
      setFilters((filters) => ({ ...filters, data: filters.data.filter((filter) => filter.id !== filterId), total: filters.total - 1 }));

      // If we are on the last page and the last command was removed, go back a page
      if (filters().total <= page() * limit()) {
        setPage((page) => Math.max(0, page - 1));
      }
    });
  };

  const handleResize = () => {
    const width = tableRef.scrollWidth;

    if (width > 1100) return setTableType(TableType.Full);
    if (width > 800) return setTableType(TableType.Compact);
    return setTableType(TableType.Mobile);
  };

  onMount(() => {
    socket.client.on('NEW_PHRASE_FILTER', createFilter);
    socket.client.on('UPD_PHRASE_FILTER', updateFilter);
    socket.client.on('DEL_PHRASE_FILTER', removeFilter);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    socket.client.off('NEW_PHRASE_FILTER', createFilter);
    socket.client.off('UPD_PHRASE_FILTER', updateFilter);
    socket.client.off('DEL_PHRASE_FILTER', removeFilter);

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
          <TableContainer class={style.commandsContainer} component={Paper}>
            <Table ref={tableRef} stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Phrase</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Similarity</TableCell>
                  <TableCell align='center' class={style.minWidthColumn} classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>Case Sensitive</TableCell>
                  <TableCell align='center' class={style.minWidthColumn} classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>Ignore Whitespace</TableCell>
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
