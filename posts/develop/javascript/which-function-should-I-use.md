---
title: 'Javascript - 어떤 function을 사용해야 할까?'
date: '2023-03-18'
tags: 'Javascript,Function,ArrowFunction'
---

![banner](./which-function-should-I-use-img/banner.png)

자바스크립트에서 function이 사용되는 여러 상황과 각 상황에 맞는 적절한 function을 정리해 보고자 한다.

## function의 여러 쓰임새

자바스크립트에서 function의 역할은 다양하며 주로 많이 사용하는 상황을 정리해 보면 다음과 같다.

1. 생성자 함수로서 객체를 생성할 때 사용
2. 객체의 메서드로서 사용
3. 일반 함수, 내부 함수로 사용
4. 이벤트 핸들러 콜백으로 사용

각 상황에서 function이 어떻게 사용되는지 또 어떻게 다른 키워드로 대체될 수 있는지 알아보도록 하겠다.

## 생성자 함수로서 객체를 생성할 때

function이 생성자 함수로서 쓰일 때는 다음과 같이 사용할 수 있다.

```js
//function 이용
function User(name, age) {
  this.name = name
  this.age = age
}

const user = new User('jeongyun', 27)

console.log(user) // { name: 'jeongyun', age: 27 }
```

function 앞에 new 키워드를 붙여서 호출하면 this는 미래에 생성될 인스턴스를 가리키게 되며
이를 이용하여 객체를 생성할 수 있다. 이 경우에 메서드는 function의 prototype 프로퍼티에 부착하는 형태로 구현할 수 있다.  
이렇게 생성자 함수로서 function이 사용될 때 대체할 키워드가 있을까?

### class를 이용하여 객체 생성

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
}

const user = new User('jeongyun', 27)
console.log(user) // { name: 'jeongyun', age: 27 }
```

ECMAScript 6에서 추가된 class를 이용하여 객체를 생성할 수 있다. constructor의 this 또한 미래에 생성될 인스턴스를 가리키게 된다.

### class와 function의 차이점

그렇다면 일반 class와 function의 차이점은 무엇이고 왜 class를 사용하여야 할까?

- class는 new 키워드 없이 호출될 수 없다.
- class로 만들어진 객체 인스턴스를 순회 시 객체 인스턴스 자신에게만 있는 값으로 순회가 가능하다.
- extends 키워드를 통한 보다 편한 상속 지원.
- 클래스 Body는 엄격 모드 안에서 실행된다.
- static 키워드를 사용하여 static method와 static property를 편하게 정의할 수 있다.

```js
function FUser(name, age) {
  this.name = name
  this.age = age
}

FUser.prototype.getName = function () {
  return this.age
}

class CUser {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  getName() {
    return this.age
  }
}

const fUser = new FUser('jeongyun', 27)
const cUser = new CUser('jeongyun', 27)

for (const key in fUser) {
  console.log(fUser[key])
}
// 메서드가 딸려온다.
// jeongyun
// 27
// [Function (anonymous)]

for (const key in cUser) {
  console.log(fUser[key])
}
// 메서드가 딸려오지 않는다.
// jeongyun
// 27
```

이러한 차이 때문에 생성자 함수로서 function보다 class를 사용하는 것이 더 낫다고 판단할 수 있다.

## 객체의 메서드로서 사용될 때

function이 객체의 메서드로서 사용될 때는 다음과 같이 간단히 표현할 수 있을 것 같다.

```js
const user = {
  name: 'jeongyun',
  age: 27,
  getName: function () {
    return this.name
  },
}
```

하지만 이렇게 객체의 메서드로 사용될 때는 this 바인딩은 객체 자신이 되며 굳이 미래에 이 함수를 통해 생성될 객체의 부모 역할을 하는 객체(프로토타입 객체)를 가리키는 prototype 프로퍼티가 필요가 없게 된다.

이런 상황에서는 ES6의 메서드 축약형을 사용하여 function을 대체할 수 있다.

```js
const user = {
  name: 'jeongyun',
  age: 27,
  getName() {
    return this.name
  },
}
```

메서드 축약형은 prototype 프로퍼티가 존재하지 않으며 동적 this 바인딩을 하기 때문에 function을 대체하여 더 가볍게 사용할 수 있다.

## 일반 함수, 내부 함수로 사용할 때

```js
// 일반함수
function sum(a, b) {
  console.log('일반함수', this)
  return a + b
}

sum()

// 내부함수
function outer() {
  function inner() {
    console.log('내부함수', this)
  }
  inner()
}
outer()
```

위와 같이 두 가지 경우 모두 this는 전역 객체에 바인딩 된다. 일반 함수의 경우 this가 필요 없고 생성자 함수로서 사용될 경우도 없기 때문에 ES6에서 추가된 ArrowFunction을 사용하여 대체할 수 있다.

ArrowFunction은 this 바인딩을 하지 않고 prototype 프로퍼티도 존재하지 않는다. 또한 arguments도 존재하지 않기 때문에 일반 함수 대비 더 가볍게 사용할 수 있다.

```js
// 일반 함수
const sum = function () {
  return [...sum.arguments].reduce((acc, cur) => acc + cur)
}
console.log(sum(1, 2, 3)) // 6

// 화살표 함수는 arguments가 없기때문에 ES6의 Rest를 사용
const sum = (...args) => {
  return args.reduce((acc, cur) => acc + cur)
}
console.log(sum(1, 2, 3)) // 6
```

내부 함수로 ArrowFunction을 사용할 경우에는 this는 상위 스코프에 바인딩 되며 기존 내부 함수의 this가 window에 바인딩 되는 단점을 해결할 수 있다.

```js
class Square {
  constructor(square) {
    this.square = square
  }
  getSquaredArr(arr) {
    console.log(this) // 자기 자신의 인스턴스에 this 바인딩이 이루어진다
    return arr.map(function (value) {
      // this 바인딩이 window 객체에 이루어져서 원하는 대로 작동하지 않는다
      return value ** this.square
    })
  }
}
```

```js
class Square {
  constructor(square) {
    this.square = square
  }
  getSquaredArr(arr) {
    console.log(this) // 자기 자신의 인스턴스에 this 바인딩이 이루어진다
    return arr.map(
      // this 바인딩을 하지 않으므로 상위 this를 가르키게 된다.
      (value) => value ** this.square
    )
  }
}

const square = new Square(2)
console.log(square.getSquaredArr([1, 2, 3, 4])) // [1, 4, 9, 16]
```

## 이벤트 핸들러의 콜백으로 사용될 때

이벤트 핸들러의 콜백으로 사용할 때는 두 가지 경우를 생각해 볼 수 있을 것 같다.

1. this 바인딩을 통하여 이벤트 리스너에 바인딩 된 요소에 접근해야 하는 경우

```js
const button = document.getElementById('button')

button.addEventListener('click', function () {
  console.log(this === button) // true
})
```

위와 같이 이벤트 핸들러의 콜백으로 일반 함수를 사용하면 this는 currentTarget(이벤트 리스너를 부착한 대상)에 바인딩 된다.

2. this 바인딩을 통하여 이벤트 리스너에 바인딩 된 요소에 접근할 필요가 없는 경우

이벤트 리스너의 콜백에 인자로 이벤트 객체가 들어오므로 this 접근이 필요없고 이벤트 객체만 이용하여 접근 할 경우에는 다음과 같이 ArrowFunction을 사용해 볼 수 있겠다.

```js
const button = document.getElementById('button')

button.addEventListener('click', (event) => {
  console.log(event.currentTarget === button) // true
})
```

## 정리

Javascript에서 각 상황별로 사용하여야 할 function을 정리해 보자면 다음과 같다.

- 생성자 함수로 사용되지 않으며 this 바인딩이 필요 없다면 -> ArrowFunction
- 생상자 함수로 사용되면 -> class
- 객체 자신에 this 바인딩을 할 용도라면 -> 메서드 축약형
- 내부 함수에서 바깥 스코프의 this를 참조해야 한다면 -> ArrowFunction
- 이벤트 핸들러를 사용하여 this 바인딩을 해야 할 경우 -> function
- 이벤트 핸들러를 사용하여 this 바인딩이 필요 없는 경우 -> ArrowFunction

이 정도로 정리해 볼 수 있을 것 같다. 하지만 결국 중요한 것은 명확하게 정해진 방법은 없다는 것이다. 자신이 해결하고자 하는 문제에 따라 또 마주친 상황에 따라 각 function의 차이를 이해하고 근거에 따라 사용하는 것이 제일 올바른 방법이라고 생각한다.
