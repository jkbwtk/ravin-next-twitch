import { createEffect, createResource, createSignal, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { CustomCommand, GetCustomCommandsResponse } from '#types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import { makeRequest } from '#lib/fetch';
import Command from '#components/Command';
import FetchFallback from '#components/FetchFallback';
import ErrorFallback from '#components/ErrorFallback';
import Widget from '#components/Widget';
import TableContainer from '@suid/material/TableContainer/TableContainer';
import Table from '@suid/material/Table/Table';
import TableHead from '@suid/material/TableHead/TableHead';
import Paper from '@suid/material/Paper/Paper';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';
import TableBody from '@suid/material/TableBody/TableBody';

import style from '#styles/widgets/CommandTableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

export interface CustomCommandProps {
  command: CustomCommand;
}

const fetchCommands = async () => {
  const { data } = await makeRequest('/api/v1/commands/custom', { schema: GetCustomCommandsResponse });

  return data.sort((a, b) => {
    if (a.command > b.command) return 1;
    if (a.command < b.command) return -1;
    return 0;
  });
};

const CommandTable: Component = () => {
  const [socket] = useSocket();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [commands, { mutate: setCommands, refetch: refetchCommands }] = createResource(fetchCommands, {
    initialValue: [],
  });

  let tableRef = document.createElement('table');

  const createCommand = (command: CustomCommand) => {
    setCommands((commands) => [...commands, command]);
  };

  const updateCommand = (command: CustomCommand) => {
    setCommands((commands) => commands.map((c) => c.id === command.id ? command : c));
  };

  const removeCommand = (commandId: number) => {
    setCommands((commands) => commands.filter((command) => command.id !== commandId));
  };

  const handleResize = () => {
    const width = tableRef.scrollWidth;

    if (width > 800) return setTableType(TableType.Full);
    if (width > 600) return setTableType(TableType.Compact);
    return setTableType(TableType.Mobile);
  };

  onMount(() => {
    socket.client.on('NEW_CUSTOM_COMMAND', createCommand);
    socket.client.on('UPD_CUSTOM_COMMAND', updateCommand);
    socket.client.on('DEL_CUSTOM_COMMAND', removeCommand);

    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onCleanup(() => {
    socket.client.off('NEW_CUSTOM_COMMAND', createCommand);
    socket.client.off('UPD_CUSTOM_COMMAND', updateCommand);
    socket.client.off('DEL_CUSTOM_COMMAND', removeCommand);

    window.removeEventListener('resize', handleResize);
  });

  createEffect(() => {
    commands.state === 'ready' && handleResize();
  });

  return (
    <Widget
      title='Custom Commands'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchCommands}
      loading={commands.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchCommands} loading={commands.state === 'refreshing'}>Failed to load commands</ErrorFallback>
      }>
        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Commands</FetchFallback>}>
          <TableContainer class={style.commandsContainer} component={Paper}>
            <Table ref={tableRef} stickyHeader>
              <TableHead >
                <TableRow>
                  <TableCell align='center'>Command</TableCell>
                  <TableCell align='center'>Template</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Full,
                  }}>User Level</TableCell>
                  <TableCell align='center' classList={{
                    [style.disabled]: tableType() > TableType.Compact,
                  }}>Cooldown</TableCell>
                  <TableCell align='center'>Enabled</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={commands()}>
                  {(command) => (
                    <Command command={command} tableType={tableType()} />
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

export default CommandTable;
