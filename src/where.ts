import F from "./functional";
import { ITable } from "./tableHandler";
import { Wrapper, liftWrapper } from "./wrapper";

export const symbolOfWhere = Symbol("where");

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

export interface WhereOfKey {
  initValue: string[];
  key: string;
}

export function mapWhereOfKeyOperation(option: WhereOfKey) {
  const wrapper = liftWrapper(option.initValue);
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

export interface WhereOfInput {
  initValue: string;
  keys: string[];
}

export function mapWhereOfInputOperation(option: WhereOfInput) {
  const wrapper = liftWrapper(option.initValue);
  const operation = whereOfInput(option.keys)(wrapper);
  return {
    wrapper,
    operation,
  };
}
