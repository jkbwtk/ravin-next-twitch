import { Config } from './types/api/auth';


export const defaultConfigValues: Config = {
  defaultPaginationLimit: 10,
  paginationLimitOptions: [5, 10, 25, 50, 100],
};
