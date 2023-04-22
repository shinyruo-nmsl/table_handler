import F from './functional'
import { ITable } from './tableHandler'
import { Wrapper, liftWrapper } from './wrapper'

const orderby = (fn: (row1: Record<string, any>, row2: Record<string, any>) => boolean, data: ITable) => F.sort(fn)(data)

export const orderbyOfCompare = (wrapper: Wrapper<(a: any, b: any) => boolean>) => F.reactive(orderby, wrapper)
