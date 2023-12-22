import { createResource, createSignal, For, onCleanup, onMount } from 'solid-js';
import { CommandTimer as CommandTimerType, CustomCommand, GetCommandTimersResponse } from '#types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import Widget from '#components/Widget';
import CommandTimer from '#components/CommandTimer';
import { makeRequest } from '#lib/fetch';

import style from '#styles/widgets/CommandTimersTableWidget.module.scss';


export enum TableType {
  Full,
  Compact,
  Mobile
}

export interface CustomCommandProps {
  command: CustomCommand;
}

const fetchCommands = async () => {
  const { data } = await makeRequest('/api/v1/commands/timers', { schema: GetCommandTimersResponse });

  return data.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
};

const CommandTimersTable: Component = () => {
  const [socket] = useSocket();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [commands, { mutate: setCommands }] = createResource(fetchCommands, {
    initialValue: [],
  });

  let tableRef = document.createElement('table');

  const createCommand = (command: CommandTimerType) => {
    setCommands((timer) => [...timer, command]);
  };

  const updateCommand = (command: CommandTimerType) => {
    setCommands((timer) => timer.map((c) => c.id === command.id ? command : c));
  };

  const removeCommand = (commandId: number) => {
    setCommands((timer) => timer.filter((command) => command.id !== commandId));
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

  return (
    <Widget
      title='Command Timers'
      class={style.container}
      containerClass={style.outerContainer}
    >
      <table ref={tableRef} class={style.commandsContainer}>
        <colgroup>
          <col />
          <col />
          <col />
        </colgroup>

        <thead>
          <tr>
            <th>Frequency</th>
            <th>Response</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <For each={commands()}>
            {(command) => (
              <CommandTimer command={command} tableType={tableType()} />
            )}
          </For>
        </tbody>
      </table>
    </Widget>
  );
};

export default CommandTimersTable;
