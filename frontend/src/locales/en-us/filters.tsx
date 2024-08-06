import { Dictionary } from '#locales/Dictionary';
import { Actions } from '#types/api/filters';


export const actions = new Dictionary<Actions, string>(
  (key) => `Unknown Action: ${key}`.trim(),
  {
    [Actions.Delete]: 'Delete',
    [Actions.Timeout]: 'Timeout',
    [Actions.Ban]: 'Ban',
  });
