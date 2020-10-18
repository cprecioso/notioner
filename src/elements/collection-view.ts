import { CollectionQueryResult } from "notion-types"
import type * as t from "notion-types"
import { NotionClient } from "../client"
import { nonEnumerable } from "../util"
import { NotionElement } from "./base"
import { Collection } from "./collection"

export const _getCollectionView = async function (
  this: NotionClient,
  collection: Collection,
  id: string
) {
  {
    const raw = this._cache.get("collection_view", id)
    if (raw) {
      return this._makeCollectionView(collection, raw)
    }
  }

  const data = await this._agent.getCollectionData(id, collection.id)
  const raw = this._cache.saveRecordMap(data.recordMap).collection_view?.[id]
    .value
  if (!raw) throw new Error("Can't find collection view")
  return this._makeCollectionView(collection, raw)
}

export const _makeCollectionView = function (
  this: NotionClient,
  collection: Collection,
  raw: t.CollectionView,
  rawResultCache?: CollectionQueryResult
) {
  return new CollectionView(this, collection, raw, rawResultCache)
}

export class CollectionView<
  T extends t.BaseCollectionView = t.CollectionView
> extends NotionElement<T> {
  @nonEnumerable public readonly collection: Collection
  @nonEnumerable protected _resultCache?: CollectionQueryResult

  constructor(
    client: NotionClient,
    collection: Collection,
    raw: T,
    rawResultCache?: CollectionQueryResult
  ) {
    super(client, raw)
    this.collection = collection
    this._resultCache = rawResultCache
  }

  async forceRefresh() {
    this._resultCache = (
      await this._root._agent.getCollectionData(this.collection.id, this.id)
    ).result
  }

  async *getResults() {
    if (!this._resultCache) {
      await this.forceRefresh()
    }

    for (const blockId of this._resultCache!.blockIds) {
      yield await this._root.getBlock(blockId, this.collection)
    }
  }

  async getAllResults() {
    return await this._root.getBlocks(
      this._resultCache?.blockIds ?? [],
      this.collection
    )
  }
}
