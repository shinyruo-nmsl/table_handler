import { createTableHandler } from './tableHandler'

const data = [
  { name: 'bridge', age: 2, gender: 'M', height: '100cm', weight: '16kg', type: 'junior' },
  { name: 'viven', age: 30, gender: 'F', height: '163cm', weight: '60kg', type: 'adult' },
  { name: 'jim', age: 29, gender: 'M', height: '180cm', weight: '88kg', type: 'adult' },
  { name: 'bar', age: 11, gender: 'F', height: '110cm', weight: '33kg', type: 'junior' },
  { name: 'foo', age: 23, gender: 'M', height: '102cm', weight: '13kg', type: 'adult' },
  { name: 'baa', age: 22, gender: 'F', height: '176cm', weight: '77kg', type: 'adult' },
]

const handler = createTableHandler(data, {
  select: {
    column: {
      initValue: ['name', 'age', 'gender', 'height', 'weight'],
    },
  },
  whereOfInput: {
    name: {
      initValue: '',
      keys: ['name'],
    },
  },
  whereOfKey: {
    age: {
      initValue: ['F', 'M'],
      key: 'age',
    },
    type: {
      initValue: ['junior', 'adult'],
      key: 'type',
    },
  },
  orderBy: {
    sortFunc: {
      initValue: <T extends { age: number }>(a: T, b: T) => a.age > b.age,
    },
  },
})
