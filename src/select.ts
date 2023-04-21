import F from "./functional";
import { ITable } from "./tableHandler";
import { Wrapper, liftWrapper } from "./wrapper";

export const symbolOfSelect = Symbol("select");

const select = (fn: (row: Record<string, any>) => Record<string, any>) => {
  const tunnel = (data: ITable) => data.map(fn);
  tunnel.type = symbolOfSelect;
  tunnel.cb = fn;
  return tunnel;
};

const selectRow = (fields: string[], row: Record<string, any>) => {
  const obj: Record<string, any> = { ...row };
  fields.forEach((field) => Reflect.deleteProperty(obj, field));
  return obj;
};
const selectOfFields = (wrapper: Wrapper<string[]>) =>
  select(F.reactive(selectRow, wrapper));

export interface SelectOfFields {
  initValue: string[];
}

export function mapSelectOfFieldsOperation(option: SelectOfFields) {
  const wrapper = liftWrapper(option.initValue);
  const operation = selectOfFields(wrapper);
  return {
    wrapper,
    operation,
  };
}
