import { Dictionary } from '#locales/Dictionary';
import { Actions } from '#shared/types/api/filters';


export const actions = new Dictionary<Actions, string>('Unknown Action', {
  [Actions.Delete]: 'Delete',
  [Actions.Timeout]: 'Timeout',
  [Actions.Ban]: 'Ban',
});
