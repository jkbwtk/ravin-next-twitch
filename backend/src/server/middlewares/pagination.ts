import { Middleware } from '#server/ExpressStack';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { z } from 'zod';

export type LimitOffsetPaginationOptions = {
  required?: boolean;
  defaultLimit?: number | null;
  maxLimit?: number | null;
  limitQueryParameter?: string;
  offsetQueryParameter?: string;
};

export const defaultLimitOffsetPaginationOptions: RequiredDefaults<LimitOffsetPaginationOptions> = {
  required: false,
  defaultLimit: null,
  maxLimit: null,
  limitQueryParameter: 'limit',
  offsetQueryParameter: 'offset',
};

export type LimitOffsetPaginationState = {
  take: number,
  skip: number
} | null;


export const limitOffsetPagination = (options: LimitOffsetPaginationOptions = {}): Middleware<
never,
  object,
  object,
{ pagination: LimitOffsetPaginationState }
> => {
  const mergedOptions = mergeOptions(options, defaultLimitOffsetPaginationOptions);

  const stateValidator = z.object({
    [mergedOptions.limitQueryParameter]: z.number({ coerce: true }).int().min(0),
    [mergedOptions.offsetQueryParameter]: z.number({ coerce: true }).int().min(0),
  });

  return (req, res) => {
    const validated = stateValidator.safeParse(req.query);

    const pagination = validated.success ? {
      take: validated.data[mergedOptions.limitQueryParameter]!,
      skip: validated.data[mergedOptions.offsetQueryParameter]!,
    } : null;

    const temp = Object.assign(req, {
      pagination,
    });

    return [temp, res];
  };
};
