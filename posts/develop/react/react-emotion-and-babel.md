---
title: 'Emotion과 관련된 Babel 세팅을 알아보자'
date: '2023-11-11'
tags: 'React,Emotion,Babel'
---

![banner](./react-emotion-and-babel-img/banner.png)

개발 시 사용되는 여러 라이브러리 (Styled-Component, Emotion, twin.macro ...) 등등 을 사용할 때 Babel 설정을 종종 손봐줘야 하는 일이 생긴다. 특히 JSX Element에 관련된 라이브러리라면
더욱더 이러한 일이 많이 일어나게 된다.

다행히 여러 기술 블로그 및 문서에 해당 라이브러리에 맞는 plugin 세팅 방법이 자세히 소개되어 있는 경우도 있지만 공식 문서 외에는 개개인마다 세팅 방법이 약간씩은 차이가 나기 때문에 해당 plugin 혹은 preset이
무슨 일을 하는지 간단하게라도 배경지식을 알아두는 것이 좋다고 생각한다.

# JsxImportSource?

Emotion의 css props를 사용하기 위한 방법 중 하나로 아래와 같이 `/** @jsxImportSource @emotion/react */` 주석을 이용하는 방법을 보았을 것이다.
이는 **JSX Pragma로 Babel의 전처리 명령을 선언**하는 주석이다. 이러한 주석은 실질적으로 무슨 역할을 할까?

Babel과 React를 같이 사용하는 경우에 React17 이전의 트랜스 파일링 방식은 아래와 같이 JSX를 `React.createElement`로 변환했었다.
**이 때문에 매번 React import가 요구되었었다.**

```js
import React from 'react'

function App() {
  return <h1>Hello World</h1>
}

// 트랜스파일링 후
import React from 'react'

function App() {
  return React.createElement('h1', null, 'Hello world')
}
```

React17 이후의 새로운 방식은 `react/jsx-runtime` 패키지의 jsx를 import 하여 변환하는 것이다. 또한 react/jsx-runtime import를 개발자가 직접 할 필요 없이 babel이 주입하는 형태로 개선되었다. 이 덕분에 `import React from 'react'`를 항상 해줄 필요가 없어졌다.

```jsx
function App() {
  return <h1>Hello World</h1>
}

// 트랜스파일링 후
import { jsx as _jsx } from 'react/jsx-runtime'

function App() {
  return _jsx('h1', { children: 'Hello world' })
}
```

보통은 위와같은 트랜스파일링을 위해 babel config에서 `@babel/preset-react` preset 혹은 `@babel/plugin-transform-react-jsx` plugin을 사용하고 있을 것 이다.

```js
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ]
}
// or
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "runtime": "automatic"
    }]
  ]
}
```

이러한 환경에서 `/** @jsxImportSource @emotion/react */` 주석을 통해 runtime jsx를 emotion 패키지로부터 import 하여 emotion의 css props를 위해 확장된 jsx를 사용하게 만들어 줄 수 있다.  
즉 `/** @jsxImportSource @emotion/react */` 주석을 기입하면 실질적으로 아래와 같이 트랜스 파일을 수행하게 한다.

```js
/** @jsxImportSource @emotion/react */

function App() {
  return <h1>Hello World</h1>
}

// 트랜스파일링 후
import { jsx as _jsx } from '@emotion/react'

function App() {
  return _jsx('h1', { children: 'Hello world' })
}
```

# jsxImportSource 관련 주석 제거

Emotion의 css prop을 사용하기 위해 매번 jsxImportSource 주석을 상단에 기입하는 작업은 매우 귀찮은 일이다.
다행히 Babel 설정을 변경할 수 있는 환경 (CRA, Vite ..)에서는 `importSource` 옵션을 통해 해결할 수 있다.

```js
// @babel/preset-react

{
  "presets": [
    ["@babel/preset-react", { "runtime": "automatic", "importSource": "@emotion/react" }]
  ],
}
```

```js
// vite 플러그인 사용 시

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
})
```

# JSX Pragma 값과 관련된 모듈 네이밍 변경

`@emotion/babel-plugin-jsx-pragmatic`, `@babel/plugin-transform-react-jsx` 이 두 가지 플러그인을 통해
동적으로 import될 패키지와 모듈의 이름까지 커스텀 할 수 있다.

TailwindCSS와 CSS-in-JS를 함께 작업할 수 있도록 도와주는 라이브러리인 twin.macro의 문서를 보면 실제로 위 두 가지 플러그인을 통해 세팅하는 방법도 가이드 하고 있다.

```js
// 공식 가이드
// https://github.com/ben-rogerson/twin.examples/tree/master/vite-emotion-typescript#add-the-vite-config

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  esbuild: {
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-macros',
          [
            '@emotion/babel-plugin-jsx-pragmatic',
            {
              export: 'jsx',
              import: '__cssprop',
              module: '@emotion/react',
            },
          ],
          [
            '@babel/plugin-transform-react-jsx',
            { pragma: '__cssprop' },
            'twin.macro',
          ],
        ],
      },
    }),
  ],
})
```

위와 같이 플러그인을 적용하였을 때 `@emotion/babel-plugin-jsx-pragmatic`에 의하여 jsx import는 다음과 같이 처리된다.

```js
/* @emotion/babel-plugin-jsx-pragmatic option
{
  export: 'jsx',
  import: '__cssprop',
  module: '@emotion/react',
}
*/

import { jsx as __cssprop } from '@emotion/react'
```

이후 `@babel/plugin-transform-react-jsx`의 pragma 옵션에 의하여 최종적으로 아래와 같이 트랜스 파일링 된다.

```js
import { jsx as __cssprop } from '@emotion/react'
import { jsxs as __cssprops } from '@emotion/react'

const profile = __cssprops('div', {
  children: [
    __cssprop('img', {
      src: 'avatar.png',
      className: 'profile',
    }),
    __cssprop('h3', {
      children: [user.firstName, user.lastName].join(' '),
    }),
  ],
})
```
