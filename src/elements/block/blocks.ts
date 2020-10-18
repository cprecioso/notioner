import * as t from "notion-types"
import { BlockMap } from "notion-types"
import { NotionClient } from "../../client"
import { collectAsyncIterable, nonEnumerable, nonNull } from "../../util"
import { NotionElement, TableName } from "../base"
import { Collection } from "../collection"

export const _getBlocks = async function (
  this: NotionClient,
  ids: string[],
  collection?: Collection
) {
  let cachedBlocks = ids.map((id) => ({
    id,
    raw: this._cache.get("block", id),
  }))
  let blocks: BlockMap = {}

  const reqIds = cachedBlocks
    .filter((block) => !block.raw)
    .map((block) => block.id)

  if (reqIds.length > 0) {
    blocks = this._cache.saveRecordMap(
      (await this._agent.getBlocks(reqIds)).recordMap
    ).block
  }

  return cachedBlocks
    .map(({ id, raw }) => {
      raw = raw ?? blocks[id].value
      return raw ? this._makeBlock(raw, collection) : undefined
    })
    .filter(nonNull)
}

export const _getBlock = async function (
  this: NotionClient,
  id: string,
  collection?: Collection
) {
  return (await this.getBlocks([id], collection))[0]
}

export const _makeBlock = function (
  this: NotionClient,
  raw: t.Block,
  collection?: Collection
) {
  switch (raw.type) {
    case "page":
      return new PageBlock(this, raw, collection)
    case "collection_view_page":
      return new CollectionViewPageBlock(this, raw, collection)
    case "text":
      return new TextBlock(this, raw, collection)
    default:
      return new BaseBlock(this, raw, collection)
  }
}

type NotionBlock = BaseBlock | TextBlock | PageBlock | CollectionViewPageBlock

export class BaseBlock<T extends t.BaseBlock = t.Block> extends NotionElement<
  T
> {
  @nonEnumerable
  protected readonly _collection?: Collection
  public readonly properties?: ReturnType<Collection["_parseProperties"]>

  constructor(client: NotionClient, raw: T, _collection?: Collection) {
    super(client, raw)
    this._collection = _collection
    this.properties = _collection?._parseProperties(raw.properties)
  }

  get type() {
    return this._raw.type as T["type"]
  }

  async getParent(): Promise<NotionBlock | undefined> {
    if ((this._raw.parent_table as TableName) === "block") {
      return await this._root.getBlock(this._raw.parent_id)
    }
    return undefined
  }
}

export class TextBlock extends BaseBlock<t.TextBlock> {
  get text() {
    return this._raw.properties?.title
  }
}

abstract class BasePageBlock<
  T extends t.PageBlock | t.CollectionViewPageBlock
> extends BaseBlock<T> {
  get title() {
    return this._raw.properties?.title
  }
}

export class PageBlock extends BasePageBlock<t.PageBlock> {
  async *getContents() {
    for (const blockId of this._raw.content ?? []) {
      yield await this._root.getBlock(blockId)
    }
  }

  async getAllContents() {
    return await collectAsyncIterable(this.getContents())
  }
}

export class CollectionViewPageBlock extends BasePageBlock<
  t.CollectionViewPageBlock
> {
  async getCollection() {
    return await this._root.getCollection(this._raw.collection_id)
  }

  async *getCollectionViews() {
    for (const collectionViewId of this._raw.view_ids) {
      yield await this._root.getCollectionView(
        await this.getCollection(),
        collectionViewId
      )
    }
  }

  async getAllCollectionViews() {
    return await collectAsyncIterable(this.getCollectionViews())
  }
}
