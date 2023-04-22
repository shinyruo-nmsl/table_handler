import F from './functional'
import { ITable } from './tableHandler'
import { Wrapper, liftWrapper } from './wrapper'

export const symbolOfSelect = Symbol('select')

const select = (fn: (row: Record<string, any>) => Record<string, any>) => {
  const tunnel = (data: ITable) => data.map(fn)
  tunnel.type = symbolOfSelect
  tunnel.cb = fn
  return tunnel
}

const selectRow = (fields: string[], row: Record<string, any>) => {
  const obj: Record<string, any> = {}
  fields.forEach((field) => (obj[field] = row[field]))
  return obj
}

export const selectOfFields = (wrapper: Wrapper<string[]>) => select(F.reactive(selectRow, wrapper))
