export class Wrapper<T> {
  static of<T>(value: T) {
    return new Wrapper(value);
  }
  constructor(public value: T) {}
}

export function liftWrapper<T>(value: T) {
  return Wrapper.of(value);
}
