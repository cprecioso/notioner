import { RecordMap } from "notion-types"
import type * as t from "notion-types"
import { ElementOfTable, TableName } from "./elements/base"
import { Values } from "./util"

type CacheObjects = {
  [K in TableName]: Map<string, ElementOfTable<K>>
}
type CacheableResponse = Partial<Pick<t.ExtendedRecordMap, TableName>>

const recordMapProxy: ProxyHandler<Values<CacheObjects>> = {
  get(target, prop) {
    if (typeof prop !== "string") throw new Error("Can't proxy non strings")
    return target.get(normalizeId(prop))
  },
}

export const normalizeId = (id: string) => id.replace(/-/g, "")

export class Cache {
  protected _caches: CacheObjects = {
    block: new Map(),
    collection: new Map(),
    collection_view: new Map(),
    notion_user: new Map(),
  }

  asRecordMap = (Object.fromEntries(
    Object.freeze(
      (Object.keys(this._caches) as (keyof CacheObjects)[]).map((key) => [
        key,
        new Proxy(this._caches[key], recordMapProxy),
      ])
    )
  ) as any) as RecordMap

  saveRecordMap<T extends CacheableResponse>(res: T) {
    for (const [tableName, table] of Object.entries(res)) {
      const cache = (this._caches as Partial<
        Record<string, CacheObjects[keyof CacheObjects]>
      >)[tableName]

      if (!cache || !table) continue

      for (const [id, el] of Object.entries(table)) {
        cache.set(normalizeId(id), el.value)
      }
    }

    return res
  }

  has(table: TableName, id: string): boolean {
    return this._caches[table].has(normalizeId(id))
  }

  get<T extends TableName>(
    table: T,
    id: string
  ): ElementOfTable<T> | undefined {
    return this._caches[table].get(normalizeId(id)) as any
  }
}
