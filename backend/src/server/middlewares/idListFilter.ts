import { Middleware } from '#server/ExpressStack';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { z } from 'zod';


export type idListFilterOptions = {
  idListFilterParameter?: string;
  maxIdListLength?: number;
};

export const defaultFilterOptions: RequiredDefaults<idListFilterOptions> = {
  idListFilterParameter: 'id',
  maxIdListLength: 100,
};

export type idListFilterState = {
  id: {
    in: number[];
  }
} | null;

export const idListFilter = (options: idListFilterOptions = {}): Middleware<
never,
  object,
  object,
{ idListFilter: idListFilterState }
> => {
  const mergedOptions = mergeOptions(options, defaultFilterOptions);

  const stateValidator = z.object({
    [mergedOptions.idListFilterParameter]: z.preprocess(
      (val) => String(val).trim().split(','),
      z.array(z.coerce.number().int().positive()).max(mergedOptions.maxIdListLength),
    ),
  });

  return (req, res) => {
    const validated = stateValidator.safeParse(req.query);

    const idListFilter = validated.success ? {
      id: {
        in: validated.data[mergedOptions.idListFilterParameter]!,
      },
    } : null;

    const temp = Object.assign(req, {
      idListFilter,
    });

    return [temp, res];
  };
};
