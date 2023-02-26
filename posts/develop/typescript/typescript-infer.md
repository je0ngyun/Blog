---
title: 'TypeScript infer 키워드를 알아보자'
date: '2023-02-26'
tags: 'TypeScript,Type'
---

![banner](./typescript-infer-img/banner.png)

# TL;DR

- TypeScript의 infer 키워드는 무엇인가?
- infer 키워드를 사용한 예제

## infer 키워드란?

조건에 따라 타입을 다르게 지정해줄 수 있는 키워드이다. 조건부 타입(condition type)와 함께 쓰이며
조건부 타입의 실제 분기점에서 타입 추론을 가능하게 한다. 또한 **infer 키워드는 조건부 타입 extends절**에서만 사용 가능하다.

### 조건부 타입

먼저 간단한 조건부 타입 예시를 봐보자

```ts
type IsNumber<T> = T extends number ? number : never
const num = 10
const str = '10'

type Result1 = IsNumber<typeof num> // number
type Result2 = IsNumber<typeof str> // never
```

IsNumber 타입은 제네릭으로 타입인자를 받아 조건부 분기를 통해 number 타입이 아닌 경우에는 never로 추론되는 것을 볼 수 있다.
위의 조건부 타입절에 infer 키워드를 적용해 보면 어떻게 될까?

```ts
type IsNumber<T> = T extends infer R ? R : never
const num = 10
const str = '10'

type Result1 = IsNumber<typeof num> // 10
type Result2 = IsNumber<typeof str> //'10'
```

infer 키워드를 적용해 봤더니 IsNumber 타입의 의도와는 다르게 타입 추론이 되는 것을 볼 수 있다.  
이는 **infer 키워드가 조건부 타입의 조건식이 참으로 평가**될 때의 값에 사용되기때문이다.

즉 Result1의 경우 제네릭의 인자로 들어간 `typeof num`(10)이 조건부 타입이 참으로 평가되기 위해서는 아래와 같이 될 것이다.

```ts
type IsNumber<T> = T extends 10 ? 10 : never
```

마찬가지로 Result2 타입의 조건부 타입이 참으로 평가되기 위해서는 아래와 같이 될 것이다.

```ts
type IsNumber<T> = T extends '10' ? '10' : never
```

위와같이 infer 키워드는 조건부 타입이 참으로 평가받을때의 타입에 선언이 되는 것으로 간주하며 이를 이용해 실제 분기시 우리가 사용할 타입을 빼올수 있게 되는것이다.

## Promise의 resolve 추론하기

infer 키워드는 조건부 타입이 참으로 평가받을경우에 해당 타입을 가져올 수 있으므로 간단한 예시로
Promise의 resolve 타입을 빼오는 유틸 타입을 만들어보자.

```ts
type MyAwaited<T extends Promise<any>> = T extends Promise<infer R> ? R : never

type TestType = Promise<number>

type Result = MyAwaited<TestType> // number
```

위의 MyAwaited 타입은 제네릭 인자로 Promise를 받아 resolve 되었을때의 타입을 반환한다.
MyAwaited에 들어간 제네릭 인자가 조건부 타입절에서 참으로 평가 되기위해서는 `Promise<number>`
타입이 되어야 하고 그 부분에 우리가 infer 키워드를 사용함으로서 `R` 타입은 `number`가 되므로 resolve 되었을때의 타입을 가져올 수 있게된다.

## Pop을 수행한 후의 배열타입을 추론하기

```ts
type arr1 = ['a', 'b', 'c', 'd']

type Pop<T extends any[]> = T extends [...infer S, any] ? S : []

type Result = Pop<arr1> // ['a', 'b', 'c']
```

MyAwaited 예제와 마찬가지로 조건부 타입에서 참으로 평가되기 위해서는 `T extends ['a','b','c','d']`가 되어야하고 그 부분에 우리가
`...infer S`를 통해 배열의 마지막 타입을 제외해 분리하였으므로 분기절에서 `S` 타입은 `['a','b','c']`가 된다.

이와같이 infer 키워드를 사용하면 런타임 상황에서의 타입 추론을 가능하게 하며, 추론한 타입 값을 infer 타입 파라미터에 할당하여 사용할 수 있게 해준다.
