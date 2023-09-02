---
title: 'React - ContextAPI는 어떤 이슈가 있을까?'
date: '2023-08-30'
tags: 'React,ContextAPI,Rerendering'
---

![banner](./react-context-api-issue-img/banner.png)

이전까지 단순히 **"ContextAPI에는 리렌더링 이슈가 있다."** 라고만 생각하며 ContextAPI 사용을 회피해 왔었다.  
하지만 최근에 Context API를 사용해야 할 경우가 있었으며, 렌더링을 최적화 하고자 노력하였다. 그 경험을 토대로 이번 포스트에서는 **어떻게 ContextAPI의 리렌더링 이슈를 회피** 할 수 있는지 정리해보고자 한다.

## ContextAPI란?

먼저 ContextAPI가 무엇인지부터 알아보자.
ContextAPI란 props를 부모에서 자식으로 넘겨주지 않고도 컴포넌트 트리 전체에 데이터를 제공할 수 있는 React의 내장된 기능이다.

```tsx
type ContextState = {
  value: number
  setValue: Dispatch<SetStateAction<number>>
}

const contextInitialValue: ContextState = {
  value: 0,
  setValue: () => {},
}

const Context = createContext<ContextState>(contextInitialValue)

function ContextExampleComponent() {
  const [value, setValue] = useState<number>(0)

  return (
    <Context.Provider value={{ value, setValue }}>
      {....}
    </Context.Provider>
  )
}
```

위 코드는 간단한 Context 구성 코드이며 `createContext`를 이용하여 Context를 생성하고
Provider를 선언하여 하위 컴포넌트들이 context value를 소비할 수 있게 해준다.

## ContextAPI의 리렌더링 이슈

ContextAPI를 사용하기 위해 조금만 검색해 봐도 ContextAPI에 리렌더링 이슈가 있다는 것을 알게 된다.
이러한 리렌더링 이슈를 극복하기 위해 크게 두 가지 관점으로 접근해 보았으며 해결 방법을 공유해 보고자 한다.

### 이슈 : Provider로 감싸진 모든 컴포넌트들이 리렌더링 된다?

Context API의 리렌더링 이슈 중 흔히 가장 많이 알고 있는 이슈로 `Provider로 감싸진 모든 컴포넌트들이 리렌더링 된다` 가 있다.
하지만 이는 정확히 말하면 ContextAPI의 이슈라기보다는 자연스러운 리액트의 리렌더링 동작 방식에 의한 것이라고 생각하며
컴포넌트 계층 구조를 잘 못 잡았을 때 발생한다.

```tsx
type ContextState = {
  value: number
  setValue: Dispatch<SetStateAction<number>>
}

const contextInitialValue: ContextState = {
  value: 0,
  setValue: () => {},
}

const Context = createContext<ContextState>(contextInitialValue)

function ContextExampleComponent() {
  const [value, setValue] = useState<number>(0)

  return (
    <Context.Provider value={{ value, setValue }}>
      <ChildComponent>
        <LeafChildComponent />
      </ChildComponent>
      <OtherChildComponent />
    </Context.Provider>
  )
}

function OtherChildComponent() {
  console.log('ChildComponent Render')
  return <></>
}

function ChildComponent({ children }: WithChildren) {
  console.log('ChildComponent Render')
  return <div>{children}</div>
}

function LeafChildComponent() {
  const { setValue } = useContext(Context)

  console.log('LeafChildComponent Render')
  return (
    <div>
      LeafChildComponent
      <button onClick={() => setValue((prevState) => prevState + 1)}>+</button>
    </div>
  )
}

export default ContextExampleComponent
```

위 코드는 리렌더링 이슈가 발생하는 코드이다. context provider의 자식으로 `ChildComponent`, `OtherChildComponent` 가 있으며
다시 ChildComponent의 자식으로 `LeafChildComponent`가 있다. 이러한 구조에서 LeafChildComponent의 버튼을 눌러 context value를 업데이트하면
어떤 컴포넌트들이 리렌더링 될까?

![banner](./react-context-api-issue-img/result1.png '#width=300px')

위 콘솔 로그처럼 모든 컴포넌트들이 리렌더링 된다. 이는 React의 `state의 업데이트로 인한 리렌더링` 때문에 `ContextExampleComponent`가 리렌더링 되면서 하위의 컴포넌트들도 같이 리렌더링되는 이유로 발생한다.  
이는 다시 말하면 **Context Provider를 구성하는 상위 컴포넌트에 대한 state 업데이트는 모든 하위 항목이 해당
Context 값을 읽는지에 상관없이 다시 렌더링 되도록 한다는 것을 의미한다.**

### Children을 통한 Rerendering 회피하기

위와 같은 이슈를 해결하기 위해서는 어떻게 해야 할까? **정답은 children을 사용함으로써 해결할 수 있다.**

```tsx{7}
// ...생략

function ContextExampleComponent({ children }: WithChildren) {
  const [value, setValue] = useState<number>(0)

  return (
    <Context.Provider value={{ value, setValue }}>{children}</Context.Provider>
  )
}

export function OtherChildComponent() {
  console.log('OtherChildComponent Render')
  return <></>
}

export function ChildComponent({ children }: WithChildren) {
  console.log('ChildComponent Render')
  return <div>{children}</div>
}

export function LeafChildComponent() {
  const { setValue } = useContext(Context)
  console.log('LeafChildComponent Render')

  return (
    <div>
      LeafChildComponent
      <button onClick={() => setValue((prevState) => prevState + 1)}>+</button>
    </div>
  )
}

export default ContextExampleComponent
```

```tsx{4,5,6,7}
function MainPage() {
  return (
    <ContextExampleComponent>
      <ChildComponent>
        <LeafChildComponent />
      </ChildComponent>
      <OtherChildComponent />
    </ContextExampleComponent>
  )
}
```

위 코드는 ContextExampleComponent 내부에 직접 하위 컴포넌트들를 배치하는 대신 children prop을 통해 간접적으로 ChildComponent들을 return 하고 있다.
`ContextExampleComponent`를 사용하는 쪽인 `MainPage` 컴포넌트에서는 ContextExampleComponent의 children prop에 JSX element들을 넘겨주고 있다.
이제 다시 context value를 업데이트해 보자.

![banner](./react-context-api-issue-img/result2.png '#width=300px')

버튼을 계속 눌러도 LeafChildComponent만 리렌더링 되는 것을 볼 수 있다.

**children을 이용하여 회피 가능한 이유가 무엇일까?**

이에 대해서 간단히 설명해 보고자 한다.
state update로 인해 ContextExampleComponent 컴포넌트가 리렌더링 될 때 Context.Provider는 여전히 리렌더링 된다.
이는 JSX을 사용할 때 결국에는 React.createElement 함수를 사용하는 방식으로 엘리먼트를 만들기 때문이다. 즉 ContextExampleComponent가 리렌더링 될 때마다
React.createElement를 통하여 Context.Provider 엘리먼트 객체를 매번 새로 만들게 된다.

그렇다면 children은 어떨까? **리액트에서 children은 prop이다.** children은 `MainPage`로부터 넘겨받은 엘리먼트 객체이며. ContextExampleComponent에서는 이를 사용하기만 할 뿐이다.
즉, MainPage 컴포넌트에서 React.createElement를 통해 만들어진 엘리먼트이기 때문에 `MainPage`가 리렌더링 되지 않는 이상 같은 엘리먼트 객체를 사용하게 된다.

### 이슈 : Context를 소비하는 컴포넌트들이 모두 리렌더링 된다?

`Provider로 감싸진 모든 컴포넌트들이 리렌더링 된다`라는 문제는 해결했지만 또 하나의 문제가 남아있다.
아래 코드처럼 OtherChildComponent에서 context value를 소비하도록 만들어 보고 다시 로그를 살펴보자.

```tsx
export function OtherChildComponent({ children }: WithChildren) {
  const { value } = useContext(Context)
  console.log('OtherChildComponent Render')

  return (
    <div>
      <div>{value}</div>
      <div>{children}</div>
    </div>
  )
}
```

![banner](./react-context-api-issue-img/result3.png '#width=300px')

OtherChildComponent와 LeafChildComponent가 모두 리렌더링 된다. OtherChildComponent는 value를 실질적으로 사용하는 컴포넌트라서 리렌더링이 일어나야 하는 것이 맞다.
하지만 value의 업데이트만 담당하는 LeafChildComponent 또한 불필요한 리렌더링이 일어나게 된다. **이는 context의 value가 바뀌었을 때 컴포넌트의 깊이에 관계없이 useContext 등을 통하여 context를 소비하는 모든 컴포넌트들이 리렌더링 되기 때문에 일어나는 이슈이다.**

### Provider를 분리하여 Rerendering 회피하기

실질적으로 사용되는 value를 업데이트하는 컴포넌트들은 굳이 리렌더링 될 필요가 없으므로 Provider를 분리하여 해결해 볼 수 있다.

```tsx{3,4,10,11,13,14}
// ...생략

const Context = createContext<ContextState['value']>(0)
const DispatchContext = createContext<ContextState['setValue']>(() => {})

function ContextExampleComponent({ children }: WithChildren) {
  const [value, setValue] = useState<number>(0)

  return (
    <Context.Provider value={value}>
      <DispatchContext.Provider value={setValue}>
        {children}
      </DispatchContext.Provider>
    </Context.Provider>
  )
}

export function OtherChildComponent({ children }: WithChildren) {
  const { value } = useContext(Context)
  console.log('OtherChildComponent Render')

  return (
    <div>
      <div>{value}</div>
      <div>{children}</div>
    </div>
  )
}

export function ChildComponent({ children }: WithChildren) {
  console.log('ChildComponent Render')
  return <div>{children}</div>
}

export function LeafChildComponent() {
  const setValue = useContext(DispatchContext)
  console.log('LeafChildComponent Render')

  return (
    <div>
      LeafChildComponent
      <button onClick={() => setValue((prevState) => prevState + 1)}>+</button>
    </div>
  )
}

export default ContextExampleComponent
```

위와 같이 `Context.Provider`, `DispatchContext.Provider`로 Provider를 분리하였다.
DispatchContext.Provider는 초깃값이 정해진 후 바뀌지 않으므로 DispatchContext를 소비하는 컴포넌트들은
value를 제공하는 Context의 값을 업데이트하더라도 리렌더링이 일어나지 않게 된다.

![banner](./react-context-api-issue-img/result4.png '#width=300px')

Context 값을 계속해서 업데이트하더라도 위 로그처럼 실질적인 context value 소비하는 `OtherChildComponent` 만 리렌더링 하게 된다.

## 정리 & 생각

- **Provider를 제공하는 컴포넌트에서는 Children을 사용하자.**
  - Context Provider를 구성하는 상위 컴포넌트에 대한 state 업데이트로 인해 모든 하위 항목이 해당 Context 값을 읽는지에 상관없이 다시 렌더링 되도록 하는 것을 막을 수 있다.
- **Value provider와 Dispatch provider를 분리하자.**
  - Context의 value가 바뀌었을 때 컴포넌트의 깊이에 관계없이 useContext 등을 통하여 context를 소비하는 모든 컴포넌트들이 리렌더링 되는 것을 막아 실질적인 value를 사용하는 컴포넌트들만 리렌더링 시키도록 할 수 있다.

최근 여러 가지 경험들을 통해 그동안 알고 있다고 생각했던 지식들이 사실은 너무나도 얕은 깊이로 머릿속에 들어가 있던 것을 깨달았다.. 어떠한 기술을 사용할 때 코드 한 줄이라도 해당 기술의 이해와 왜 사용하는지 등의 이유를 정확히 인지하고 개발에 임해야 한다는 것을 명심해야겠다.
