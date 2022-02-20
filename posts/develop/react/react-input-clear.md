---
title: 'React 간단하게 input 값 초기화 하기'
date: '2021-08-20'
tags: 'React,input,input 초기화'
---

블로그 포스팅 검색에 쓰일 컴포넌트를 만들면서 input요소에서 blur 이벤트시에 input 값을 초기화해주는 작업이 필요하였다.

<img width="55%" alt="search-component" src="https://user-images.githubusercontent.com/33706043/130780440-45f89cc6-d488-4557-a925-6b7d6b16ca58.png"></img>

위와같은 상태에서 blur 이벤트시에 검색 결과창이 닫히는 기능은 구현을 하였고 input값의 초기화가 필요하여서 다음과 같은 방법을 사용하게 되었다.

기본적으로 React는 key를 사용하여 컴포넌트를 구분하기 때문에 **key의 값이 바뀌면 요소가 새로 랜더링**되게 된다.
이를 이용하여서 ref없이 간단하게 input 초기화를 할 수 있게 되었다.

```js
//Search.js

const [inputEleKey, setInputEleKey] = useState(0)

function handleInputBlur() {
  setResult(isEmptyResult => (isEmptyResult = true))
  setInputEleKey(inputEleKey => inputEleKey + 1) //rerender용 key 값 증가
}

...
<div>
  <input
    type="text"
    placeholder="🔍 태그 검색"
    aria-label="Search"
    onChange={e => handleInputChange(e)}
    onBlur={e => handleInputBlur(e)}
    key={inputEleKey} //키 추가
  />
  {!isEmptyResult && (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={e => handleMouseDown(e)}
      className="result-container"
    >
      {renderSearchResults()}
    </div>
  )}
</div>
```

위와 같은 방법을 통하여 쉽게 input요소의 값을 초기화 시켜줄 수 있지만 단지 새로 랜더링 되는 것 뿐이기 때문에
**비동기 작업을 child props로 가지고 있는 form 요소와 같은 곳**에서 이러한 방법을 쓴다면 시간지연으로 인한 깜빡임이 생기는 단점이 있을 것 같다.
