---
title: '브라우저에서 뒤로가기시 스크롤 위치 저장을 방지하는법'
date: '2022-09-26'
tags: 'History,Scroll,ScrollRestoration'
---

## 1. 문제 발생 상황

현업에서 PWA 프로젝트를 진행하던 때였다. 기능구현이 어느정도 끝나고 테스트 과정중 뒤로가기 동작에서 브라우저가 이전 페이지의 스크롤 위치를 기억하고
자동으로 스크롤 되어버리는 문제가 발생하였다. 웹이 최대한 앱과 같이 보여야 하였는데 모바일에서 뒤로가기 동작(화면 스와이핑 혹은 자체 뒤로가기 버튼)을 취할 시
자동으로 저장된 스크롤위치로 돌아가버렸기 때문에 자동 스크롤 저장을 막아야하는 상황이었다.

## 2. 원인

React Router Dom의 `Link` 컴포넌트나 `useNavigate` 훅을 사용하여 이전페이지 url을 직접주어 새롭게 history에 쌓았을때는 위와같은 문제가 일어나지 않았지만
전 페이지로 이동시 **history의 index 접근 방식으로 구현하면 문제가 발생**하는 것을 보아 history 객체와 관련이 있어보였다.

```tsx
const navigate = useNavigate()
navigate(-1) // 문제 발생
navigate('/page/before/') // 명시적으로 전페이지 url를 지정할 경우 문제 X
```

history 객체와 스크롤위치 저장의 관계에 대해 찾아보던중 history 객체의 속성인 `scrollRestoration`와 관련이 있다는 것을 알게되었다.

### scrollRestoration?

> The scrollRestoration property of History interface allows web applications to explicitly set default scroll restoration behavior on history navigation. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)

`scrollRestoration` 속성은 웹 응용프로그램의 스크롤 복원을 명시적으로 설정할 수 있는 속성이다.  
허용 가능한 값으로는 `auto`와 `manual`이 있으며 기본값은 `auto`이다.
`scrollRestoration` 속성이 `auto` 일때는 스크롤 위치가 자동 복원되고
`manual`일 때는 자동으로 복원되지 않는다.

## 3. 해결

**앱의 시작점에서 history 객체의 scrollRestoration 값을 manual로 바꿔준다.**  
나와 같은 경우에는 Scroll를 관리를 담당하는 컴포넌트에서 수행해 주었다.

```jsx
const PageScrollManager = ({ children }: Props) => {
  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])
  ///...
  return children
}
```
