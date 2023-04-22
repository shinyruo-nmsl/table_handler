# Handle Table Data In Typescript Like SQL

example:
``` typescript
const data = [
  { name: 'bridge', age: 2, gender: 'M', height: 100, weight: '16kg', type: 'junior' },
  { name: 'viven', age: 30, gender: 'F', height: 163, weight: '60kg', type: 'adult' },
  { name: 'jim', age: 29, gender: 'M', height: 180, weight: '88kg', type: 'adult' },
  { name: 'bar', age: 11, gender: 'F', height: 110, weight: '33kg', type: 'junior' },
  { name: 'foo', age: 23, gender: 'M', height: 102, weight: '13kg', type: 'adult' },
  { name: 'baa', age: 22, gender: 'F', height: 176, weight: '77kg', type: 'adult' },
]
```

create a handler:
``` typescript
import { createTableHandler } from './tableHandler'

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
```

then you can  excute it for the first time:
``` typescript
handler.excute()
```
output:
``` typescript
[
  { name: 'bridge', age: 2, gender: 'M', height: 100, weight: '16kg', type: 'junior' },
  { name: 'bar', age: 11, gender: 'F', height: 110, weight: '33kg', type: 'junior' },
  { name: 'baa', age: 22, gender: 'F', height: 176, weight: '77kg', type: 'adult' },
  { name: 'foo', age: 23, gender: 'M', height: 102, weight: '13kg', type: 'adult' },
  { name: 'jim', age: 29, gender: 'M', height: 180, weight: '88kg', type: 'adult' },
  { name: 'viven', age: 30, gender: 'F', height: 163, weight: '60kg', type: 'adult' },
]
```
you can change the value of what you have setted in handler, just like write sql:
``` typescript
handler.select.column.value = ['name', 'age', 'gender', 'height']
handler.whereOfInput.name.value = 'b'
handler.orderBy.sortFunc.value = <T extends { height: number }>(a: T, b: T) => a.height > b.height
console.log(handler.excute())
```
output:
``` typescript
[
  { name: 'bridge', age: 2, gender: 'M', height: 100 },
  { name: 'bar', age: 11, gender: 'F', height: 110 },
  { name: 'baa', age: 22, gender: 'F', height: 176 }
]
```


