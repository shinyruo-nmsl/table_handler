type Rest<T> = T extends [any, ...infer U] ? U : never;

type First<T> = T extends [infer U, ...any[]] ? U : never;

type Last<T> = T extends [...any[], infer U] ? U : never;

type Idx<T, K> = K extends keyof T ? T[K] : never;

type Reverse<T extends any[]> = T["length"] extends 0
  ? []
  : [...Reverse<Rest<T>>, First<T>];

function curry<T extends (...args: any[]) => any>(fn: T) {
  return function recur(...args1: any[]) {
    if (args1.length >= fn.length) {
      return fn(...args1);
    }
    return function (...args2: any[]) {
      return recur.apply(null, [...args1, ...args2]);
    };
  };
}

function partial<
  P1 extends any[],
  P2 extends any[],
  T extends (...args: [...P1, ...P2]) => any
>(fn: T, ...args: P1) {
  return function (...args2: P2): ReturnType<T> {
    return fn(...(args.concat(args2) as [...P1, ...P2]));
  };
}

function compose<Arr extends any[], Begin extends any>(
  ...fns: [(arg: Begin) => any, ...any] & {
    [I in keyof Arr]: (arg: Idx<[any, ...Arr], I>) => Arr[I];
  }
): (arg: Begin) => Last<Arr> {
  return function (val) {
    return fns.reduce((input, fn) => {
      return fn(input);
    }, val) as any;
  };
}

function reverse<T extends (...args: any[]) => any>(
  fn: T
): (...args: Reverse<Parameters<T>>) => ReturnType<T> {
  return function (...revereArgs: Reverse<Parameters<T>>) {
    const args = revereArgs.slice(0, fn.length).reverse();
    return fn(...args);
  };
}

function identity<T>(val: T): T {
  return val;
}

const tap =
  <T>(effect: (val: T) => void) =>
  (val: T) => {
    effect(val);
    return val;
  };

const alt =
  <F extends (...arg: any[]) => any>(f: F) =>
  <G extends (...arg: Parameters<F>) => any>(g: G) =>
  (
    ...arg: Parameters<F>
  ): ReturnType<F> extends undefined | null ? ReturnType<G> : ReturnType<F> => {
    return f(...arg) || g(...arg);
  };

const seq = <First extends (...args: any[]) => any, T extends any[]>(
  ...fns: [First, ...any] & {
    [I in keyof T]: (...args: Parameters<First>) => T[I];
  }
) => {
  return function (...args: Parameters<First>) {
    fns.forEach((fn) => fn(...args));
  };
};

const fork =
  <F1 extends (...args: any[]) => any>(func1: F1) =>
  <F2 extends (...args: Parameters<F1>) => any>(func2: F2) =>
  <J extends (p1: ReturnType<F1>, p2: ReturnType<F2>) => any>(join: J) => {
    return function (...args: Parameters<F1>): ReturnType<J> {
      return join(func1(...args), func2(...args));
    };
  };

const map =
  <T extends (...args: any[]) => any>(fn: T) =>
  (...args: Parameters<T>): ReturnType<T> => {
    return fn(...args);
  };

type Wrapper<T> = {
  value: T;
};

const fmap =
  <W extends (arg: any) => Wrapper<any>>(wrapper: W) =>
  <F extends (...args: any[]) => Parameters<W> extends [infer U] ? U : never>(
    fn: F
  ) =>
  (...args: Parameters<F>): ReturnType<W> => {
    return wrapper(fn(...args)) as any;
  };

const sort =
  <T>(compare: (a: T, b: T) => boolean) =>
  (l: T[]): T[] => {
    return [...l].sort((a: T, b: T) => {
      if (compare(a, b)) return 1;
      return -1;
    });
  };

const filter =
  <T>(fn: (a: T) => boolean) =>
  (l: T[]): T[] => {
    return [...l].filter(fn);
  };

const reactive =
  <T extends (...args: any[]) => any>(
    fn: T,
    wrapper: Wrapper<First<Parameters<T>>>
  ) =>
  (...rest: Rest<Parameters<T>>): ReturnType<T> => {
    return fn(wrapper.value, ...rest);
  };

export default {
  curry,
  partial,
  compose,
  identity,
  tap,
  alt,
  seq,
  fork,
  map,
  fmap,
  sort,
  filter,
  reverse,
  reactive,
};
