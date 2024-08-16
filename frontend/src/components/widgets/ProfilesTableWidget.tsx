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
import { BehaviorProfileApi, GetBehaviorProfilesPaginatedResponse } from '#types/api/behaviorProfiles';
import Profile from '#components/Profile';

import style from '#styles/widgets/TableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

const fetchProfiles = async (pagination: Pagination) => {
  const response = await makeRequest('/api/v1/behaviorProfiles/', {
    schema: GetBehaviorProfilesPaginatedResponse,
    params: getSearchParams(pagination),
  });

  return response;
};

const ProfilesTableWidget: Component = () => {
  const [socket] = useSocket();
  const [session] = useSession();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [page, setPage] = createSignal(0);
  const [limit, setLimit] = createSignal(session.config.defaultPaginationLimit);
  const [profiles, { mutate: setProfiles, refetch: refetchProfiles }] = createResource(createPagination(limit, page), fetchProfiles, {
    initialValue: {
      data: [],
      total: 0,
      limit: 0,
      offset: 0,
    },
    name: 'profiles',
  });

  let tableRef = document.createElement('table');

  const createProfile = () => {
    refetchProfiles();
  };

  const updateProfile = (profile: BehaviorProfileApi) => {
    setProfiles((filters) => ({ ...filters, data: filters.data.map((f) => f.id === profile.id ? profile : f) }));
  };

  const removeProfile = (profileId: number) => {
    batch(() => {
      setProfiles((profiles) => ({ ...profiles, data: profiles.data.filter((filter) => filter.id !== profileId), total: profiles.total - 1 }));

      // If we are on the last page and the last command was removed, go back a page
      if (profiles().total <= page() * limit()) {
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
    socket.client.on('NEW_BEHAVIOR_PROFILE', createProfile);
    socket.client.on('UPD_BEHAVIOR_PROFILE', updateProfile);
    socket.client.on('DEL_BEHAVIOR_PROFILE', removeProfile);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    socket.client.off('NEW_BEHAVIOR_PROFILE', createProfile);
    socket.client.off('UPD_BEHAVIOR_PROFILE', updateProfile);
    socket.client.off('DEL_BEHAVIOR_PROFILE', removeProfile);

    window.removeEventListener('resize', handleResize);
  });

  // Handle resize when table data is loaded
  createEffect(() => {
    profiles.state === 'ready' && handleResize();
  });

  return (
    <Widget
      title='Profiles'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchProfiles}
      loading={profiles.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchProfiles} loading={profiles.state === 'refreshing'}>
          Failed to load behavior profiles
        </ErrorFallback>
      }>
        <Paginator page={[page, setPage]} limit={[limit, setLimit]} total={() => profiles().total} />

        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Behavior Profiles</FetchFallback>}>
          <TableContainer class={style.commandsContainer} component={Paper}>
            <Table ref={tableRef} stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Name</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Title Activator</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Category Activator</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>
                    Description
                  </TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Forced</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Enabled</TableCell>
                  <TableCell align='center' class={style.minWidthColumn}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={profiles().data}>
                  {(profile) => (
                    <Profile profile={profile} tableType={tableType()} />
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

export default ProfilesTableWidget;
