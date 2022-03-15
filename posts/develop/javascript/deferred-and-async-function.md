---
title: 'async funtion에서 Deferred를 사용하여 상태연계하기'
date: '2022-03-14'
tags: 'Async,Deferred,비동기'
---

# TL;DR

- Deferred를 이용한 Promise 객체들 간의 연계
- async function 안에서의 Deferred 이용시 장점

## async function

모두가 알듯이 async function은 항상 Promise 객체를 리턴한다.  
만약 async 함수의 반환값이 명시적으로 promise가 아니라면 암묵적으로 promise로 감싸지기 때문이다.  
아래 두 출력은 동일한 결과값을 같는다는 것을 보아 async function의 return 값은 Promise 에서 resolve를 하는것과 마찬가지 라는것을 알 수 있다.

```js
const AsyncFunction = async () => {
  return 1
}

Promise.resolve(1).then(console.log) // 1
AsyncFunction().then(console.log) // 1
```

또한 async function안에서의 await는 Promise가 fulfilled 혹은 rejected 되기를 기다리면서 async function 내부의 실행을 멈춘다.  
async function이 실제로 Block 된 것은 아니고 보이지 않는 .then을 통해 다음 코드들을 담아둔다고 알고있다.

```js
const AsyncFunction = async () => {
  await new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, 1500)
  })
  console.log('이 로그는 1.5초 뒤에 찍힌다.')
}
```

그렇다면 async function에서 일정 시간후 혹은 어떠한 사건이 끝나고 return 하고싶다면 어떻게 해야 할까?

```js
// 첫번째 방법
async function test() {
  setTimeout(() => {
    return { userName: 'jeongYun' } // setTimeout 콜백의 리턴이므로 당연히 안된다.
  }, 1500)
}
```

```js
// 두번째 방법
async function test() {
  return await new Promise((res, rej) => {
    setTimeout(() => res({ userName: 'jeongYun' }), 1500)
  })
} // 가능은 하지만 굳이 async function로 wrapping할 이유가 없다.
```

Deferred를 통한 방법은 아래에서 알아보도록 하겠다.

## Asynchronous example

비동기처리에 대한 상황으로 여러가지를 들 수 있겠지만 간단히 아래의 예를 들어보려고 한다.
하나의 버튼이 있고 버튼이 눌리기 전까지 Block 해야하는 상황이다.
내가 프로젝트를 진행하면서 이러한 상황은 보통 팝업창의 확인버튼을 누를때까지 기다려야할때 나왔던 것 같다.
아래는 간략화한 코드이다.

```js
//버튼이 눌릴때 true resolve
function wait() {
  return new Promise((res, rej) => {
    const handleClick = (e) => {
      res(true)
    }
    const btn = document.querySelector('.btn')
    addEventListener('click', handleClick)
  })
}

;(async function () {
  console.log(`버튼이 눌리기 전`)
  await wait()
  console.log(`버튼이 눌렸습니다.`)
})()
```

Promise의 콜백에서 버튼이 눌릴때 resolve를 해주고 버튼이 눌리면
로그를 찍는 간단한 코드이다.
나는 원래 이런스타일로 코드를 작성하였지만 문득 async function을 사용하여 더 깔끔하게 작성해보고 싶어서
구글링하던중 Deferred를 알게되었다.

## Deferred

원래 Deferred는 JQuery에서 비동기 처리에 Promise객체를 연계하여 상태를 전파하는 것을 목적으로 구현된 객체이지만
JQuery에서 뿐만 아니라 Promise상태를 외부에서 변경시킬 수 있게 할수있는 객체를 생성하는 클래스 혹흔 함수 이름으로 사용되는것 같다.  
내가 여러 문서를 찾아보며 작성한 Deffered 클래스는 다음과 같다. 물론 아래코드는 정답이 아니며 개인적으로 작성해 사용한 클래스이다.

```js{2,5,6,7,8,12,11}
const CreateDeffered = (() => {
  let resolve, reject
  return class Deffered extends Promise {
    constructor(
      executor = (_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      }
    ) {
      super(executor)
      this.resolve = resolve
      this.reject = reject
    }
  }
})()
```

우선 Promise를 상속받아 동작하도록 하였고 클로저를 이용하여 Promise의 콜백함수의 resolve와 reject를 밖으로 빼내었다.  
그 후 Deffered 클래스의 resolve와 reject 멤버에 할당하여 외부에서 Promise의 상태를 변경가능케 하였다.
또한 생성자의 매개변수로 executor를 넣어주어 Promise의 후속처리 메서드인 then 메서드와 catch메서드도 작동가능케 하였다.
그럼 Deffered를 사용하여 async function에서 일정시간뒤 return하는 코드를 작성해 보자.

```js{2,6,7}
async function test() {
  const deferred = new CreateDeffered()
  setTimeout(() => {
    deferred.resolve()
  }, 1500)
  await deferred // deferred의 상태가 resolve 혹은 reject될때까지 아래의 코드가 Block됨
  return { userName: 'jeongYun' } // 결과적으로 1.5초 뒤 return
}

test().then(console.log)
```

Deferred 객체와 async function의 상태를 연계되어 작동하는것을 볼 수 있다.

### 장점

이렇게 연계하여 작성하는 방식의 장점은 무엇이 있을까? 솔직히 이러한 방법이 Best Practice인지는 모르겠으나
내가 사용하며 느낀 장점은 추가적인 Promise객체관련 로직을 작성하지 않아서인지 드러나는것은 async/await 밖에 없으므로
좀더 코드가 동기적으로 보여 깔끔해진것 같았고 핵심로직 작성에만 집중할 수 있었던것 같다.

## 응용해보기

[좀전에 만든 버튼예제](#asynchronous-example) 코드를 Deferred를 사용한 방식으로 바꾸어 보자.

```js{3,5,9}
//버튼이 눌릴때 true resolve
async function wait() {
  const deferred = new CreateDeffered()
  const handleClick = (e) => {
    deferred.resolve(true)
  }
  const btn = document.querySelector('.btn')
  addEventListener('click', handleClick)
  return await deferred
}

;(async function () {
  console.log(`버튼이 눌리기 전`)
  await wait()
  console.log(`버튼이 눌렸습니다.`)
})()
```

개인적인 생각일수도 있으나 async function과 Deferred의 상태 연계를 통해서 좀 더 깔끔해진 것 같다.

## 마치며...

틀린 부분이 있을 수도 있고 최선의 방법이 아닐 수 있지만 이것저것 찾아보며 공부 및 구현 했던 내용을 정리해 보았습니다.  
코드에 오류가 있거나 수정해야할 부분은 댓글 남겨주시면 빠르게 수정 하도록 하겠습니다.
