import { createTableHandler } from './tableHandler'

const data = [
  { name: 'bridge', age: 2, gender: 'M', height: 100, weight: '16kg', type: 'junior' },
  { name: 'viven', age: 30, gender: 'F', height: 163, weight: '60kg', type: 'adult' },
  { name: 'jim', age: 29, gender: 'M', height: 180, weight: '88kg', type: 'adult' },
  { name: 'bar', age: 11, gender: 'F', height: 110, weight: '33kg', type: 'junior' },
  { name: 'foo', age: 23, gender: 'M', height: 102, weight: '13kg', type: 'adult' },
  { name: 'baa', age: 22, gender: 'F', height: 176, weight: '77kg', type: 'adult' },
]

const handler = createTableHandler(data, {
  select: {
    column: {
      initValue: ['name', 'age', 'gender', 'height', 'weight', 'type'],
    },
  },
  whereOfInput: {
    name: {
      initValue: '',
      keys: ['name'],
    },
  },
  whereOfKey: {
    sex: {
      initValue: ['F', 'M'],
      key: 'gender',
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

console.log(handler.excute())

handler.select.column.value = ['name', 'age', 'gender', 'height']
handler.whereOfInput.name.value = 'b'
handler.orderBy.sortFunc.value = <T extends { height: number }>(a: T, b: T) => a.height > b.height
console.log(handler.excute())
