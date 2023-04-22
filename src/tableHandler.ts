import F from './functional'
import { Wrapper, liftWrapper } from './wrapper'
import { symbolOfSelect, selectOfFields } from './select'
import { whereOfKey, symbolOfWhere, WhereOfInput, mapWhereOfInputOperation } from './where'
import { orderbyOfCompare } from './orderBy'

export type ITable = Record<string, any>[]

export interface WhereOfKey {
  initValue: string[]
  key: string
}

export function mapWhereOfKeyOperation(option: WhereOfKey) {
  const wrapper = liftWrapper(option.initValue)
  const operation = whereOfKey(option.key)(wrapper)
  return {
    wrapper,
    operation,
  }
}

export interface SelectOfFields {
  initValue: string[]
}

export function mapSelectOfFieldsOperation(option: SelectOfFields) {
  const wrapper = liftWrapper(option.initValue)
  const operation = selectOfFields(wrapper)
  return {
    wrapper,
    operation,
  }
}

export interface OrderBy {
  initValue: (a: any, b: any) => boolean
}

export function mapOrderByOperation(option: OrderBy) {
  const wrapper = liftWrapper(option.initValue)
  const operation = orderbyOfCompare(wrapper)
  return {
    wrapper,
    operation,
  }
}

/**
 * two optimization points:
 * 1.compose(map(f), map(g)) => map(compose(f, g))
 * 2.compose(filter(f), filter(g)) => filter(x => f(x) && g(x))
 */
function optimizeOpreations(opreations: ((table: ITable) => ITable)[]): ((table: ITable) => ITable)[] {
  const selects: ((row: Record<string, any>) => Record<string, any>)[] = []

  const wheres: ((row: Record<string, any>) => boolean)[] = []

  const rest = opreations.filter((operation: any) => {
    if (operation.type && operation.type === symbolOfSelect) {
      selects.push(operation.cb)
      return false
    } else if (operation.type && operation.type === symbolOfWhere) {
      wheres.push(operation.cb)
      return false
    } else {
      return true
    }
  })

  const newSelect = (data: ITable): ITable => data.map(F.compose(...(selects as any)))

  const newWhere = (data: ITable): ITable => data.filter((row) => wheres.every((where) => where(row)))

  return [newWhere, ...rest, newSelect]
}

class QueryStrategy {
  constructor(public data: ITable, public opreations: ((table: ITable) => ITable)[]) {}
  excute(): ITable | Error {
    if (this.opreations.length > 0) {
      return F.compose(...(this.opreations as any))(this.data)
    } else {
      throw new Error('opreations must has at least one element')
    }
  }
}

type QueryOption = {
  whereOfKey?: {
    [key: string]: WhereOfKey
  }
  whereOfInput?: {
    [key: string]: WhereOfInput
  }
  select?: {
    [key: string]: SelectOfFields
  }
  orderBy?: {
    [key: string]: OrderBy
  }
}

export function createTableHandler<Data extends ITable, Option extends QueryOption>(
  data: Data,
  option: Option
): {
  [T in keyof Option]: {
    [P in keyof Option[T]]: T extends 'whereOfKey'
      ? Wrapper<string[]>
      : T extends 'whereOfInput'
      ? Wrapper<string>
      : T extends 'select'
      ? Wrapper<string[]>
      : T extends 'orderBy'
      ? Wrapper<(a: any, b: any) => boolean>
      : never
  }
} & { excute: () => Data } {
  const props: Record<string, any> = {}

  // const proxyProps: Record<string, any> = {}

  const operations = Object.keys(option).reduce((totalOperations: ((table: ITable) => ITable)[], key: string) => {
    props[key] = {}
    const operations = Object.keys(option[key as keyof QueryOption]!).reduce((arr: ((table: ITable) => ITable)[], k) => {
      let obj
      if (key === 'whereOfKey') {
        obj = mapWhereOfKeyOperation(option[key]![k])
      } else if (key === 'whereOfInput') {
        obj = mapWhereOfInputOperation(option[key]![k])
      } else if (key === 'select') {
        obj = mapSelectOfFieldsOperation(option[key]![k])
      } else {
        obj = mapOrderByOperation(option[key as keyof QueryOption]![k] as OrderBy)
      }
      props[key][k] = obj.wrapper
      return [...arr, obj.operation]
    }, [])

    // tip: something went wrong when use Proxy in Vue2.x
    // use Proxy to make user use `hander[type][prop] = *` instead of use `hander[type][prop].value = *`
    // proxyProps[key] = new Proxy(props[key], {
    //   get(target: { [key: string]: Wrapper<any> }, p: string) {
    //     if (typeof p === 'symbol' || p.startsWith('_')) return Reflect.get(target, p)
    //     return Reflect.get(target, p)
    //   },
    //   set(target: { [key: string]: Wrapper<any> }, p: string, newValue: any) {
    //     return (target[p].value = newValue)
    //   },
    // })

    return [...totalOperations, ...operations]
  }, [])

  const strategy = new QueryStrategy(data, optimizeOpreations(operations))

  return {
    ...props,
    excute: () => strategy.excute(),
  } as any
}
