import type * as t from "notion-types"
import { NotionClient } from "../client"
import { makeReadonly, nonEnumerable, Values } from "../util"

export type TableName = Values<
  {
    [K in keyof t.ExtendedRecordMap]: t.ExtendedRecordMap[K] extends t.NotionMap<
      any
    >
      ? K
      : never
  }
>

export type ElementOfTable<
  T extends TableName
> = t.ExtendedRecordMap[T] extends t.NotionMap<infer T> ? T : never

export abstract class NotionElement<
  T extends Omit<ElementOfTable<TableName>, "type">
> {
  @nonEnumerable protected _root: NotionClient
  @nonEnumerable public _raw: T

  constructor(client: NotionClient, raw: T) {
    this._root = client
    this._raw = raw
  }

  get id() {
    return this._raw.id
  }

  getRaw() {
    return makeReadonly(this._raw)
  }
}
