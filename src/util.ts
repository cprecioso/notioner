export type Values<T> = T[keyof T]

export type Primitive = string | number | symbol | boolean | undefined | null

export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends Map<infer K, infer U>
  ? ReadonlyMap<K, DeepReadonly<U>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : never

export const makeReadonly = <T>(v: T): DeepReadonly<T> => v as DeepReadonly<T>

export const nonNull = <T>(v: T | undefined | null): v is T => v != null

export const nonEnumerable: PropertyDecorator = (target, propertyKey) => {
  Object.defineProperty(target, propertyKey, {
    configurable: false,
    writable: true,
    enumerable: false,
  })
}

export type ConstructorType<T extends {} = {}, A extends any[] = any[]> = {
  new (...args: A): T
  prototype: T
}

export const collectAsyncIterable = async <T>(
  asyncIterable: AsyncIterable<T>
) => {
  const res: T[] = []
  for await (const el of asyncIterable) {
    res.push(el)
  }
  return res
}
