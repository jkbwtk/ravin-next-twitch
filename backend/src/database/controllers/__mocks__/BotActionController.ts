import { BotActionController as BotActionControllerReal } from '#database/controllers/BotActionController';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';


export const BotActionController = mockDeep<typeof BotActionControllerReal>();

beforeEach(() => {
  mockReset(BotActionController);
});
