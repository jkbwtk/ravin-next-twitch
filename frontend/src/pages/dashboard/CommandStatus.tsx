import DashboardPage from '#components/DashboardPage';
import DashboardInfoBar from '#components/DashboardInfoBar';
import { CustomCommandEditorProvider } from '#providers/CustomCommandEditorProvider';
import { batch, createResource, For, onCleanup, onMount } from 'solid-js';
import { CustomCommand, CommandStatus as CustomCommandStatus, GetCustomCommandsStatusResponse } from '#shared/types/api/commands';
import { useSocket } from '#providers/SocketProvider';
import CommandStatusTile from '#components/CommandStatusTile';

import style from '#styles/dashboard/CommandStatus.module.scss';


const fetchStatuses = async () => {
  const response = await fetch('/api/v1/commands/custom/status');
  const data = await response.json() as GetCustomCommandsStatusResponse;

  return data.data.sort((a, b) => {
    if (a.command.id > b.command.id) return 1;
    if (a.command.id < b.command.id) return -1;
    return 0;
  });
};

const CommandStatus: Component = () => {
  const [socket] = useSocket();
  const [statuses, { mutate: setStatuses }] = createResource(fetchStatuses, {
    initialValue: [],
  });

  const createCommand = (command: CustomCommand) => {
    batch(() => {
      setStatuses((s) => s.map((ss) => ({
        command: ss.command,
        lastUsed: 0,
        lastUsedBy: undefined,
      })));

      setStatuses((s) => [...s, {
        command: command,
        lastUsed: 0,
      }]);
    });
  };

  const updateCommand = (command: CustomCommand) => {
    setStatuses((s) => s.map((c) => ({
      command: c.command.id === command.id ? command : c.command,
      lastUsed: 0,
      lastUsedBy: undefined,
    })));
  };

  const removeCommand = (commandId: number) => {
    batch(() => {
      setStatuses((s) => s.map((ss) => ({
        command: ss.command,
        lastUsed: 0,
        lastUsedBy: undefined,
      })));

      setStatuses((s) => s.filter((c) => c.command.id !== commandId));
    });
  };

  const executeCommand = (status: CustomCommandStatus) => {
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
    <DashboardPage>
      <CustomCommandEditorProvider>
        <div class={style.container}>
          <DashboardInfoBar / >
          <div class={style.commands}>
            <For each={statuses()}>
              {CommandStatusTile}
            </For>
          </div>
        </div>
      </CustomCommandEditorProvider>
    </DashboardPage>
  );
};

export default CommandStatus;
