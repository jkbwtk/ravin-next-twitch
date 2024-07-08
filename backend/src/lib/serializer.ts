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
