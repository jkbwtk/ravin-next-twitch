import { createResource, createSignal, For, onCleanup, onMount } from 'solid-js';
import { CustomCommand, GetCustomCommandsResponse } from '#types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import Command from '#components/Command';

import style from '#styles/widgets/CommandTableWidget.module.scss';
import Widget from '#components/Widget';


export enum TableType {
  Full,
  Compact,
  Mobile
}

export interface CustomCommandProps {
  command: CustomCommand;
}

const fetchCommands = async () => {
  const response = await fetch('/api/v1/commands/custom');
  const { data } = await response.json() as GetCustomCommandsResponse;

  return data.sort((a, b) => {
    if (a.command > b.command) return 1;
    if (a.command < b.command) return -1;
    return 0;
  });
};

const CommandTable: Component = () => {
  const [socket] = useSocket();
  const [tableType, setTableType] = createSignal<TableType>(TableType.Full);
  const [commands, { mutate: setCommands }] = createResource(fetchCommands, {
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

  return (
    <Widget
      title='Custom Commands'
      class={style.container}
      containerClass={style.outerContainer}
    >
      <table ref={tableRef} class={style.commandsContainer}>
        <colgroup>
          <col />
          <col />
          <col classList={{
            [style.disabled]: tableType() > TableType.Full,
          }} />
          <col classList={{
            [style.disabled]: tableType() > TableType.Compact,
          }} />
          <col />
          <col />
        </colgroup>

        <thead>
          <tr>
            <th>Command</th>
            <th>Response</th>
            <th classList={{
              [style.disabled]: tableType() > TableType.Full,
            }}>User Level</th>
            <th classList={{
              [style.disabled]: tableType() > TableType.Compact,
            }}>Cooldown</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <For each={commands()}>
            {(command) => (
              <Command command={command} tableType={tableType()} />
            )}
          </For>
        </tbody>
      </table>
    </Widget>
  );
};

export default CommandTable;
