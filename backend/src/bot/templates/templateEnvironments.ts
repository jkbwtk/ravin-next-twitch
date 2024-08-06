import { TemplateEnvironments } from '#types/database/columns';
import { Context } from 'isolated-vm';


export type EnvironmentProvider = (context: Context) => void;

export const testEnvironments: Record<TemplateEnvironments, EnvironmentProvider> = {
  generic: () => void 0,

  command: (context) => {
    const jail = context.global;

    jail.setSync('channel', '[CHANNEL]');
    jail.setSync('args', 'arg1 arg2');
    jail.setSync('user', '[USER]');
    jail.setSync('username', '[USERNAME]');
  },

  timer: (context) => {
    const jail = context.global;

    jail.setSync('channel', '[CHANNEL]');
  },
};
