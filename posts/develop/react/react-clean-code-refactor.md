---
title: 'React Clean Code를 위한 리펙토링'
date: '2022-03-04'
tags: 'React,Clean Code,Refactor'
---

개발을 하면서 리펙토링은 필수적이다 새로운 기능을 추가하여 코드 디자인을 개선해야 할때 소프트웨어를 보다 쉽게 이해할 수 있게
Clean Code를 작성하는 것이 중요하다고 생각한다.  
여러 프로젝트들을 진행 하면서 내 코드가 읽기쉬운 코드인지에 대한 확신이 없었다. 그래서 앞으로 개발을 하면서 참고할 가이드라인을 정리해보려고 한다.

## Example

예시로 아래와 같이 예약기능을 간단히 만들어 보았다. 예약버튼을 누르면 선택한 날짜로 예약을 요청하되 만약 약관동의 등 사용자가 필수로 확인해야할 내용을
보지 않았다면 팝업창을 띄우게 하였다.

## Code before refactoring

```jsx{7,10,12,13}
const Reservation = ({ title }: ReservationProps) => {
  const datePicker = useRef<HTMLInputElement>(null)
  const [예약상태, set예약상태] = useState('예약 전 입니다.')

  const handle예약 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { userName, tos } = await 유저정보불러오기()
    const date = datePicker.current?.value
    if (!tos) {
      await 알림팝업창열기()
    }
    const res = await 예약요청({ userName, date })
    res.success && set예약상태(`${date} 예약완료`)
  }

  return (
    <section>
      <h2>{title}</h2>
      <div>{예약상태}</div>
      <form onSubmit={handle예약}>
        <input ref={datePicker} type="date" />
        <button type="submit">예약</button>
      </form>
    </section>
  )
}
```

위 코드는 리펙토링 전 코드이다 하이라이팅된 부분을 봐보면 알수있듯이 예약버튼을 눌렀을때 핸들러 함수는 다음과같은 일을 처리한다.

1. **유저정보를 불러온다.**
2. **필수 확인 (약관동의 등)을 읽지 않았을 경우 팝업창을 연다.**
3. **예약을 요청한다.**
4. **예약이 성공적으로 이루어졌을 경우 상태를 바꿔준다.**

## Problem?

위 코드의 문제점은 무엇일까?  
언뜻 보기에 현재까지는 타당한 코드로 보인다. 하지만 기능이 추가된다면 코드를 읽기 어려워진다.
예를 들어 예약상태를 현재페이지에서 보여주는것이 아닌 또다른 팝업창을 띄워서 사용자에게 보여줘야한다면
이를위한 또 다른 팝업 함수 혹은 컴포넌트 형식 팝업을 만들어야한다.

또한 `알림팝업창열기` 라는 함수에 핵심데이터가 숨겨져 있어서 어떤 내용의 팝업을 띄우게 되는지 파악하기 어려워지고
이는 상세한 코드 파악에 어려움을 줌과 동시에 팝업호출 함수의 재사용성도 낮아진다.  
이외에도 `handle예약` 함수가 너무 많은 일을 처리한다는 문제점도 있다.

## Guidelines for resolution

이러한 문제점을 해결하기 위해서 다음과 같은 사항을 고려해보았으며 Clean Code 작성을 위한 가이드라인으로 활용해 보려고 한다.  
하지만 꼭 아래의 사항을 모두 지킬수 없는 상황이 있을 수 있다. 상황에 맞게 유연하게 적용하는것이 중요할 것 같다.

### 단일책임

하나의 함수가 될수있으면 하나의 일을 하도록 해준다.  
또한 함수가 뚜렷한 이름을 가지도록하여 코드에 대한 신뢰를 높이자.

### 응집도

가독성을 위해 하나의 목적을 가진 코드를 뭉쳐서 응집도를 높혀준다.  
단, 코드 파악에 필수적인 핵심데이터를 제외한 세부구현단계만 뭉치는 것이 좋다.

### 추상화와 재사용성

컴포넌트의 재사용성을 높이기위해 중요 개념만 남기고 추상화 시킨다.  
코드를 구성하는 컴포넌트들의 추상화 수준을 비슷하게 해주면 코드 파악을 더욱 쉽게 할 수 있다.

## Code after refactoring

[리펙토링전 코드](#code-before-refactoring)에 몇가지 기능을 추가하고 리펙토링해보자.
추가 기능으로 예약완료 문구를 화면에 렌더링하는 대신 예약 성공시에는 성공문구와 예약날짜 팝업을 띄워주고
실패시에는 실패문구 팝업을 띄워주는 기능을 추가해야한다고 가정해보자.

```jsx{14,28,32}
const Reservation = ({ title }: ReservationProps) => {
  const [user, setUser] = useState<User>()
  const datePicker = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const user = await 유저정보불러오기()
      setUser(user)
    })()
  })

  const 알림팝업열기 = async () => {
    if (!user?.tos) {
      return await 팝업창열기({ render: <알림내용 /> })
    }
    return true
  }

  const 예약요청하기 = async () => {
    const { userName } = user as User
    const date = datePicker.current?.value as string
    const res = await 예약요청({ userName, date })
    return res.success
  }

  const 예약완료팝업열기 = async () => {
    const date = datePicker.current?.value as string
    await 팝업창열기({ render: <div>{`${date} 예약완료`}</div>, cancelButton: false })
  }

  const 예약실패팝업열기 = async () => {
    await 팝업창열기({ render: <div>{`예약실패`}</div>, cancelButton: false })
  }

  const handle예약 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    ;(await 알림팝업열기()) && (await 예약요청하기())
      ? await 예약완료팝업열기()
      : await 예약실패팝업열기()
  }

  return (
    <section>
      <h2>{title}</h2>
      <form onSubmit={handle예약}>
        <input ref={datePicker} type="date" />
        <button type="submit">예약</button>
      </form>
    </section>
  )
}

```

하이라이팅된 부분을 봐보면 알수있듯이 기존 `알림팝업창열기` 함수를 추상화시켜 `팝업열기` 함수를 작성하였다.  
`팝업열기` 함수는 [render-props](https://reactjs.org/docs/render-props.html) 패턴처럼
팝업창에 렌더링될 엘리먼트를 전달한다.  
**핵심데이터(렌더링정보,취소버튼유무)** 등만 남겨놓고 추상화 시켰기 때문에 팝업창이 어떠한 내용을 담고 있는지 쉽게 알 수 있고
재사용성도 좋아지게되었다.  
또한 여러가지일을 하고있던 기존 `handle예약` 함수를 리펙토링하면서 하나의 일을하는 여러 함수들로 분할하였다.

### Example after refactoring

![after-refactor-example](./react-clean-code-refactor-img/after-refactor-example.gif '#width=50%')

## 결론

이해하기 쉬운 Clean Code를 작성하는 것은 중요하다. 개발을 하면서 기능을 추가하다 보면 읽기 어려운 코드가 생기는 것은 피할 수 없고
더 나은 코드를 위한 리펙토링을 해주어야한다.  
물론 리펙토링에 정답은 없고 내가 작성한 코드도 정답이 아니다. 하지만 같은 기능을 하는 코드라도 남이 읽기 쉽고 나도 읽기 쉬운 코드가 된다면 당연히 일의 효율이 증가한다.
`짧은 코드 !== 읽기쉬운코드` 인것을 명심하며 코드변경을 두려워하지 않고 더 나은 코드를 작성하기 위해 열심히 공부해야겠다.
