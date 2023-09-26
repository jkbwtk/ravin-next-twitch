/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor = { new(...args: any[]): object };

export type ClassInstance = InstanceType<Constructor>;

export type WirableType<T extends Constructor> = InstanceType<T> & {
  __parent: InstanceType<Constructor>
};

export interface AutoWirable {
  __parent: ClassInstance;
}

const findWirable = <T extends Constructor>(target: T, parent: InstanceType<Constructor>): WirableType<T> | null => {
  let p = parent;

  while (p !== null) {
    if (p instanceof target) {
      return p as WirableType<T>;
    }

    const metadata = Reflect.getMetadata('wire:provides', p.constructor) as Map<Constructor, string | symbol> ?? new Map();

    const key = metadata.get(target);

    if (key) {
      return (p as any)[key] as WirableType<T>;
    }

    p = (p as WirableType<T>).__parent ?? null;
  }

  return null;
};

export const Wirable = () => (target: InstanceType<Constructor>, propertyKey: string | symbol): void => {
  const type = Reflect.getMetadata('design:type', target, propertyKey) as Constructor;
  const metadata = (Reflect.getMetadata('wire:provides', target.constructor) as Map<Constructor, string | symbol>) ?? new Map();

  metadata.set(type, propertyKey);

  Reflect.defineMetadata('wire:provides', metadata, target.constructor);
};


export const wire = <I extends AutoWirable, T extends Constructor>(caller: I, Target: T): WirableType<T> => {
  const instance = findWirable(Target, caller.__parent);

  if (!instance) {
    throw new Error(`Cannot find wirable for ${Target.name}`);
  }

  return instance;
};
