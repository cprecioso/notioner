import type * as t from "notion-types"
import { NotionClient } from "../client"
import { NotionElement } from "./base"
import { _makeProperty } from "./block/props"

export const _getCollection = async function (this: NotionClient, id: string) {
  const raw = await this._cache.get("collection", id)
  if (!raw) throw new Error("Can't find collection in cache")
  return this._makeCollection(raw)
}

export const _makeCollection = function (
  this: NotionClient,
  raw: t.Collection
) {
  return new Collection(this, raw)
}

export class Collection extends NotionElement<t.Collection> {
  public _parseProperties(properties: Record<string, any>) {
    return new Map(
      Object.entries(properties).map(([id, value]) => {
        const def = this._raw.schema[id]
        return [def.name, _makeProperty(def, value)]
      })
    )
  }
}
