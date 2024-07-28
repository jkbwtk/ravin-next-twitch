import { z } from 'zod';


export function serializer<T, R>(transformer: (value: T) => R) {
  return <TT extends T | T[]>(value: TT): TT extends T ? R : R[] => {
    if (Array.isArray(value)) {
      // @ts-expect-error - Union based return types are not supported
      return value.map(transformer);
    }

    // @ts-expect-error - Union based return types are not supported
    return transformer(value as T);
  };
}

export function clonePickedKeys<T extends z.AnyZodObject>(schema: T): { [P in keyof T['_output']]: true } {
  return {
    ...(Object.fromEntries(Object.keys(schema._def.shape()).map((k) => [k, true])) as { [P in keyof T['_output']]: true }),
  };
};

export function zodSerializer<Z extends z.ZodTypeAny, T extends z.input<Z>, R extends z.output<Z>>(schema: Z): ReturnType<typeof serializer<T, R>> {
  return serializer<T, R>(schema.parse);
}
