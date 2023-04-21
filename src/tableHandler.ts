import F from "./functional";

// handle the table like SQL

type ITable = Record<string, any>[];

class Wrapper<T> {
  static of<T>(value: T) {
    return new Wrapper(value);
  }
  constructor(public value: T) {}
}

function mapWrapper<P extends { initValue: any }>(option: P) {
  return Wrapper.of(option.initValue);
}

// where
const symbolOfWhere = Symbol("where");
const where = (fn: (row: Record<string, any>) => boolean) => {
  const tunnel = (data: ITable) => data.filter(fn);
  tunnel.type = symbolOfWhere;
  tunnel.cb = fn;
  return tunnel;
};

const filterByKey = <T extends Record<string, any>>(
  selected: string[],
  key: keyof T & string,
  row: T
) => {
  return (
    !selected.length || selected.find((name) => name === row[key]) !== undefined
  );
};

export const whereOfKey =
  <T extends Record<string, any>>(key: keyof T & string) =>
  (wrapper: Wrapper<string[]>) =>
    where(F.partial(F.reactive(filterByKey, wrapper), key));

interface WhereOfKey {
  initValue: string[];
  key: string;
}

function mapWhereOfKeyOperation(option: WhereOfKey) {
  const wrapper = mapWrapper(option);
  const operation = whereOfKey(option.key)(wrapper);
  return {
    wrapper,
    operation,
  };
}

const filterByInput = <T extends Record<string, any>>(
  input: string,
  keys: (keyof T & string)[],
  row: T
) => {
  return !!keys.find((key: keyof T) => row[key].includes(input));
};

const whereOfInput =
  <T extends Record<string, any>>(keys: (keyof T & string)[]) =>
  (wrapper: Wrapper<string>) =>
    where(F.partial(F.reactive(filterByInput, wrapper), keys));

interface WhereOfInput {
  initValue: string;
  keys: string[];
}

function mapWhereOfInputOperation(option: WhereOfInput) {
  const wrapper = mapWrapper(option);
  const operation = whereOfInput(option.keys)(wrapper);
  return {
    wrapper,
    operation,
  };
}

// select
const symbolOfSelect = Symbol("select");
const select = (fn: (row: Record<string, any>) => Record<string, any>) => {
  const tunnel = (data: ITable) => data.map(fn);
  tunnel.type = symbolOfSelect;
  tunnel.cb = fn;
  return tunnel;
};

const selectRow = (fields: string[], row: Record<string, any>) => {
  const obj: Record<string, any> = F.clone(row);
  fields.forEach((field) => Reflect.deleteProperty(obj, field));
  return obj;
};
const selectOfFields = (wrapper: Wrapper<string[]>) =>
  select(F.reactive(selectRow, wrapper));
interface SelectOfFields {
  initValue: string[];
}

function mapSelectOfFieldsOperation(option: SelectOfFields) {
  const wrapper = mapWrapper(option);
  const operation = selectOfFields(wrapper);
  return {
    wrapper,
    operation,
  };
}

// orderby
const orderby = (
  fn: (row1: Record<string, any>, row2: Record<string, any>) => boolean,
  data: ITable
) => F.sort(fn)(data);

export const orderbyOfCompare = (
  wrapper: Wrapper<(a: any, b: any) => boolean>
) => F.reactive(orderby, wrapper);
interface OrderBy {
  initValue: (a: any, b: any) => boolean;
}

function mapOrderByOperation(option: OrderBy) {
  const wrapper = mapWrapper(option);
  const operation = orderbyOfCompare(wrapper);
  return {
    wrapper,
    operation,
  };
}

/**
 * two optimization points:
 * 1.compose(map(f), map(g)) => map(compose(f, g))
 * 2.compose(filter(f), filter(g)) => filter(x => f(x) && g(x))
 */
function optimizeOpreations(
  opreations: ((table: ITable) => ITable)[]
): ((table: ITable) => ITable)[] {
  const selects: ((row: Record<string, any>) => Record<string, any>)[] = [];
  const wheres: ((row: Record<string, any>) => boolean)[] = [];
  const rest = opreations.filter((operation: any) => {
    if (operation.type && operation.type === symbolOfSelect) {
      selects.push(operation.cb);
      return false;
    } else if (operation.type && operation.type === symbolOfWhere) {
      wheres.push(operation.cb);
      return false;
    } else {
      return true;
    }
  });
  const newSelect = (data: ITable): ITable =>
    data.map(F.compose(...(selects as any)));
  const newWhere = (data: ITable): ITable =>
    data.filter((row) => wheres.every((where) => where(row)));
  return [newSelect, newWhere, ...rest];
}

class QueryStrategy {
  constructor(
    public data: ITable,
    public opreations: ((table: ITable) => ITable)[]
  ) {}
  excute(): ITable | Error {
    if (this.opreations.length > 0) {
      return F.compose(...(this.opreations as any))(this.data);
    } else {
      throw new Error("opreations must has at least one element");
    }
  }
}

type QueryOption = {
  whereOfKey?: {
    [key: string]: WhereOfKey;
  };
  whereOfInput?: {
    [key: string]: WhereOfInput;
  };
  select?: {
    [key: string]: SelectOfFields;
  };
  orderBy?: {
    [key: string]: OrderBy;
  };
};

export function createTableHandler<
  Data extends ITable,
  Option extends QueryOption
>(
  data: Data,
  option: Option
): {
  [T in keyof Option]: {
    [P in keyof Option[T]]: T extends "whereOfKey"
      ? Wrapper<string[]>
      : T extends "whereOfInput"
      ? Wrapper<string>
      : T extends "select"
      ? Wrapper<string[]>
      : T extends "orderBy"
      ? Wrapper<(a: any, b: any) => boolean>
      : never;
  };
} & { excute: () => Data } {
  const props: Record<string, any> = {};

  // const proxyProps: Record<string, any> = {}

  const operations = Object.keys(option).reduce(
    (totalOperations: ((table: ITable) => ITable)[], key: string) => {
      props[key] = {};
      const operations = Object.keys(option[key as keyof QueryOption]!).reduce(
        (arr: ((table: ITable) => ITable)[], k) => {
          let obj;
          if (key === "whereOfKey") {
            obj = mapWhereOfKeyOperation(option[key]![k]);
          } else if (key === "whereOfInput") {
            obj = mapWhereOfInputOperation(option[key]![k]);
          } else if (key === "select") {
            obj = mapSelectOfFieldsOperation(option[key]![k]);
          } else {
            obj = mapOrderByOperation(
              option[key as keyof QueryOption]![k] as OrderBy
            );
          }
          props[key][k] = obj.wrapper;
          return [...arr, obj.operation];
        },
        []
      );
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
      return [...totalOperations, ...operations];
    },
    []
  );

  const strategy = new QueryStrategy(data, optimizeOpreations(operations));

  return {
    ...props,
    excute: () => strategy.excute(),
  } as any;
}
