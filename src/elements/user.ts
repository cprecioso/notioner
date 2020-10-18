import * as t from "notion-types"
import { UserMap } from "notion-types"
import { NotionClient } from "../client"
import { nonNull } from "../util"
import { NotionElement } from "./base"

export const _getUsers = async function (this: NotionClient, ids: string[]) {
  let cachedUsers = ids.map((id) => ({
    id,
    raw: this._cache.get("notion_user", id),
  }))
  let users: UserMap = {}

  const reqIds = cachedUsers.filter((user) => !user.raw).map((user) => user.id)

  if (reqIds.length > 0) {
    users = this._cache.saveRecordMap({
      notion_user: Object.fromEntries(
        (await this._agent.getUsers(reqIds)).results.map((user) => [
          user.id,
          { role: "none", value: user },
        ])
      ),
    }).notion_user
  }

  return cachedUsers
    .map(({ id, raw }) => {
      raw = raw ?? users[id].value
      return raw ? this._makeUser(raw) : undefined
    })
    .filter(nonNull)
}

export const _getUser = async function (this: NotionClient, id: string) {
  return (await this.getUsers([id]))[0]
}

export const _makeUser = function (this: NotionClient, raw: t.User) {
  return new User(this, raw)
}

export class User extends NotionElement<t.User> {}
