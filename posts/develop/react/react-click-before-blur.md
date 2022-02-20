---
title: 'React Blur 이벤트 전에 Click 이벤트를 실행하는 법'
date: '2021-08-20'
tags: 'React,이벤트,Blur 이벤트,이벤트순위'
---

최근 정적 블로그 사이트를 제작하면서 검색기능으로 다음과 같은 컴포넌트를 만들게 되었는데

<img width="55%" alt="search-component" src="https://user-images.githubusercontent.com/33706043/130780440-45f89cc6-d488-4557-a925-6b7d6b16ca58.png"></img>

사용자가 포스트 태그를 검색할 수 있게 검색창을 네비게이션 바에 위치시키고 검색 결과가 있을경우 아래에 보여주는식으로
컴포넌트를 구성하였었다.

그 후 아래 코드와 같이 검색 결과창이 존재하는 상태에서 다른곳을 클릭하였을때 검색결과창을 닫아주기 위하여 검색창에 Blur 이벤트를 적용하여 검색결과를 초기화 해주었다.

```js
//Search.js
function handleInputBlur() {
  setResult(isEmptyResult => (isEmptyResult = true))
}

...
<div>
  <input
    type="text"
    placeholder="🔍 태그 검색"
    aria-label="Search"
    onChange={e => handleInputChange(e)}
    onBlur={e => handleInputBlur(e)}
  />
  {!isEmptyResult && (
    <div className="result-container">{renderSearchResults()}</div>
  )}
</div>
```

이렇게 잘 구성하였다고 생각하였지만 한가지 문제점이 발생하였다...  
바로 검색 결과창에 표출되는 링크를 누르는 순간 **Blur 이벤트가 먼저 트리거되어 검색 결과창이 사라져 버리는** 경우가 발생하였다. 이 때문에 검색결과로 표출된 링크를 누르지 못하는 상황이 벌어졌다..

문제 해결을 위해 구글을 검색하다가 [다음과 같은 글](https://stackoverflow.com/questions/17769005/onclick-and-onblur-ordering-issue)을 보았고 onMouseDown 이벤트를 통하여 blur 이벤트의 실행을 막을 수 있다는 것을 알았고 onMouseDown 이벤트를 다음과 같이 추가하였다.

```js
//Search.js
function handleMouseDown(e) {
  e.preventDefault()
}
...
<div>
  <input
    type="text"
    placeholder="🔍 태그 검색"
    aria-label="Search"
    onChange={e => handleInputChange(e)}
    onBlur={e => handleInputBlur(e)}
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

**mouseDown 이벤트 발생시 preventDefault 를 하여** 이벤트 전파를 막음으로서 검색창 기능이 정상적으로 작동할 수 있게 하였다.
