import * as client from "notion-client"
import { Cache } from "./cache"
import {
  CollectionViewPageBlock,
  PageBlock,
  _getBlock,
  _getBlocks,
  _getCollection,
  _getCollectionView,
  _getUser,
  _getUsers,
  _makeBlock,
  _makeCollection,
  _makeCollectionView,
  _makeUser,
} from "./elements"

export declare namespace NotionClient {
  export interface Options {
    authToken?: string
    userLocale?: string
    userTimeZone?: string
  }
}

export class NotionClient {
  public _agent: client.NotionAPI
  public _cache = new Cache()

  constructor(options?: NotionClient.Options) {
    this._agent = new client.NotionAPI({
      ...options,
      apiBaseUrl: "https://www.notion.so/api/v3",
    })
  }

  async getPage(id: string) {
    this._cache.saveRecordMap(await this._agent.getPage(id))
    return (await this.getBlock(id)) as PageBlock | CollectionViewPageBlock
  }
}

export interface NotionClient {
  getBlock: typeof _getBlock
  getBlocks: typeof _getBlocks
  _makeBlock: typeof _makeBlock

  getCollection: typeof _getCollection
  _makeCollection: typeof _makeCollection

  getCollectionView: typeof _getCollectionView
  _makeCollectionView: typeof _makeCollectionView

  getUser: typeof _getUser
  getUsers: typeof _getUsers
  _makeUser: typeof _makeUser
}

NotionClient.prototype.getBlock = _getBlock
NotionClient.prototype.getBlocks = _getBlocks
NotionClient.prototype._makeBlock = _makeBlock

NotionClient.prototype.getCollection = _getCollection
NotionClient.prototype._makeCollection = _makeCollection

NotionClient.prototype.getCollectionView = _getCollectionView
NotionClient.prototype._makeCollectionView = _makeCollectionView

NotionClient.prototype.getUser = _getUser
NotionClient.prototype.getUsers = _getUsers
NotionClient.prototype._makeUser = _makeUser
