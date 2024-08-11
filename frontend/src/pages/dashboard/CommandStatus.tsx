import DashboardInfoBar from '#components/DashboardInfoBar';
import { CustomCommandEditorProvider } from '#providers/CustomCommandEditorProvider';
import { createResource, For, onCleanup, onMount } from 'solid-js';
import { CustomCommandApi, CustomCommandState, GetCustomCommandsStatusResponse } from '#types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import CommandStatusTile from '#components/CommandStatusTile';
import { makeRequest } from '#lib/fetch';

import style from '#styles/dashboard/CommandStatus.module.scss';


const fetchStatuses = async () => {
  const { data } = await makeRequest('/api/v1/commands/custom/status', { schema: GetCustomCommandsStatusResponse });

  return data.sort((a, b) => {
    if (a.command.id > b.command.id) return 1;
    if (a.command.id < b.command.id) return -1;
    return 0;
  });
};

const CommandStatus: RouteComponent = (props) => {
  const [socket] = useSocket();
  const [statuses, { mutate: setStatuses }] = createResource(fetchStatuses, {
    initialValue: [],
  });

  const createCommand = (command: CustomCommandApi) => {
    setStatuses((s) => [...s, {
      command: command,
      lastUsed: 0,
    }]);
  };

  const updateCommand = (command: CustomCommandApi) => {
    if (command.enabled === false) {
      return removeCommand(command.id);
    }
    const exists = statuses().find((s) => s.command.id === command.id);

    if (!exists) {
      return createCommand(command);
    }

    setStatuses((s) =>
      s.map((c) => ({
        command: c.command.id === command.id ? command : c.command,
        lastUsed: c.command.id === command.id ? 0 : c.lastUsed,
        lastUsedBy: c.command.id === command.id ? undefined : c.lastUsedBy,
      })));
  };

  const removeCommand = (commandId: number) => {
    setStatuses((s) => s.filter((c) => c.command.id !== commandId));
  };

  const executeCommand = (status: CustomCommandState) => {
    setStatuses((s) => s.map((c) => c.command.id !== status.command.id ? c : {
      command: c.command,
      lastUsed: status.lastUsed,
      lastUsedBy: status.lastUsedBy,
    }));
  };

  onMount(() => {
    socket.client.on('NEW_CUSTOM_COMMAND', createCommand);
    socket.client.on('UPD_CUSTOM_COMMAND', updateCommand);
    socket.client.on('DEL_CUSTOM_COMMAND', removeCommand);
    socket.client.on('COMMAND_EXECUTED', executeCommand);
  });

  onCleanup(() => {
    socket.client.off('NEW_CUSTOM_COMMAND', createCommand);
    socket.client.off('UPD_CUSTOM_COMMAND', updateCommand);
    socket.client.off('DEL_CUSTOM_COMMAND', removeCommand);
    socket.client.off('COMMAND_EXECUTED', executeCommand);
  });

  return (
    <CustomCommandEditorProvider>
      <div class={style.container}>
        <DashboardInfoBar metadata={props.data?.metadata} />
        <div class={style.commands}>
          <For each={statuses()}>
            {CommandStatusTile}
          </For>
        </div>
      </div>
    </CustomCommandEditorProvider>
  );
};

export default CommandStatus;
