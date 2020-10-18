import * as t from "notion-types"
import { Values } from "../../util"

type _PropertyDefinition<
  T extends t.PropertyType
> = t.CollectionPropertySchema & { type: T }

type _AllPropertyDefinition = Values<
  { [P in t.PropertyType]: _PropertyDefinition<P> }
>

export const _makeProperty = (
  definition: _AllPropertyDefinition,
  value: any
) => {
  switch (definition.type) {
    case "file":
      return new FileProperty(definition, value)
    default:
      return new BaseProperty(definition, value)
  }
}

export class BaseProperty<T extends t.PropertyType, V> {
  constructor(
    protected _definition: _PropertyDefinition<T>,
    protected _value: V
  ) {}

  get name() {
    return this._definition.name
  }

  getRawValue() {
    return this._value
  }

  get type() {
    return this._definition.type
  }
}

export class FileProperty extends BaseProperty<"file", [string]> {}
