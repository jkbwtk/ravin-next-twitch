import { Dictionary } from '#locales/Dictionary';
import { TemplateEnvironments } from '#types/api/templates';


export const templateEnvironments = new Dictionary<TemplateEnvironments, string>(
  (key) => key ?? 'Unknown Environment',
  {
    generic: 'Generic',
    command: 'Command',
    timer: 'Command Timer',
  });

export const templateEnvironmentAbbreviations = new Dictionary<TemplateEnvironments, string>(
  (key) => key?.slice(0, 3) ?? '???',
  {
    generic: 'Gen',
    command: 'Cmd',
    timer: 'Tim',
  });
