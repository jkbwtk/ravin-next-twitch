import { ConfigController as ConfigControllerReal } from '#database/controllers/ConfigController';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';


export const ConfigController = mockDeep<typeof ConfigControllerReal>();

beforeEach(() => {
  mockReset(ConfigController);
});
