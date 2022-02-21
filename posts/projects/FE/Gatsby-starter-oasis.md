---
title: 'Gasby-Starter-Oasis'
date: '2022-02-21'
tags: '쉽게 시작하는 풀 패키지 블로그 스타터'
tech: 'React,Gatsby,Markdown,Sass'
period: '2022.02 ~ 2022.02'
desc: '과거에 진행했던 개인 블로그 프로젝트를 리펙토링 및 기능추가하여 제작;하이라이트 기반 UI와 Github Typography 베이스;페이지 기반으로 포스트 관심사들을 1차 분류;페이지내 사이드바의 카테고리로 2차 세부 분류;쉬운 블로그 세팅을 위해 하나의 Config 파일로 통합;빠른 페이지 생성을 위한 CLI tool 제공;포스트 검색기능 제공;Lighthouse Report를 참고하여 퍼포먼스를 향상;GA, SEO, RSS, Sitemap, Robots.txt 적용 및 제공'
---

![main-intro](../FE/Gatsby-starter-oasis-img/intro-img.png)

## Table Of Contents

> - [Motivation](#motivation)
> - [Key Functions](#key-functions)
> - [Some Folder Structure](#some-folder-structure)
> - [Learned it](#learned-it)

## Motivation

약 반년전 개인블로그를 React와 Gatsby 프레임워크를 통해 제작한 후에 진로방향을 웹 프론트엔드 개발자로
결정하였습니다.  
두달간 Javascript를 새로 공부해 보는 시간을 가졌고 틈틈히 코딩테스트 문제도 Javascript로 풀어보는 시간을 가졌습니다.  
두달이 지난후 과거에 진행했던 프로젝트 코드를 보게 되었고 리펙토링의 필요성을 느꼈습니다.
리펙토링을 진행하면서 아직 부족한 실력이지만 남들도 쉽게 사용할 수 있는 템플릿을 하나 만들어보자 라고 결심하였고
많은 블로그 템플릿이 있지만 페이지별로 관심사를 나누어 포스팅 할 수 있는 템플릿은 찾아보기 힘들었기 때문에 페이지별로 관심사를 나눌수 있게 하는것을 주 목표로 하여 프로젝트를 진행하게 되었습니다.

## Key Functions

블로그 스타터의 주요 기능은 다음과 같습니다.

### 페이지 기반 관심사 분류

Next나 Gatsby의 **파일기반 정적 라우팅 방식**처럼 사용자가 특정위치에 마크다운 파일을 생성하면 폴더구조에 따라 자동으로 주소가 생성되게 하고 싶었습니다. 이를위해 먼저 posts 폴더를 하나 만들어서 기준점으로 설정하고 하위에 생성되는 폴더구조에 따라 포스트의 주소가 자동적으로 알맞게 부여 될 수 있도록 개발하였습니다.

```bash
./posts
├── index.md # 홈화면 내용
└── projects # 프로젝트 페이지의 게시물들
    ├── BE # 세부 카테고리 (사이드바 카테고리에 포함)
    │   ├── 10plusServer.md
    │   └── Cardme.md
    └── FE # 세부 카테고리 (사이드바 카테고리에 포함)
        ├── 10plusKiosk.md
        ├── Gatsby-starter-oasis-img
        │   ├── CLI-tool.gif
        │   └── intro-img.png
        └── Gatsby-starter-oasis.md # 현재 포스트

```

**위는 현재 포스트를 작성하는 시점의 일부 폴더구조입니다.**  
현재 포스트인 `Gatsby-starter-oasis.md` 파일은 `${사용자주소}/projects/FE/Gatsby-starter-oasis/`의 URI로 생성됩니다.

이를 구현하기 위해 Gatsby에서 markdown파일만을 조회하는 플러그인 대신 쿼리가 길어질 수 있지만 [전체 파일을 조회하여 필터링](https://github.com/je0ngyun/gatsby-starter-oasis/blob/master/src/pages/projects/index.js#L52) 하는 방식을 사용하였습니다.

### 보다 쉬운 페이지 생성을 위한 CLI tool

페이지기반으로 포스트를 분류했지만 여전히 문제점은 남아있었습니다. 사용자가 새로운 주제의 페이지를 만들고자 할때 해야할 작업이 많아지기 때문이었습니다. 이를 해결하기 위해 쉬운 페이지 생성을 위한 CLI tool을 개발하였습니다.

![CLI tool](../FE/Gatsby-starter-oasis-img/CLI-tool.gif)

**위는 CLI tool을 실행하여 Life란 이름의 페이지를 생성하는 모습입니다.**  
만들 페이지 이름 및 페이지 설명을 입력하면 자동으로 Gatsby가 라우팅 하는 `./src/pages/` 폴더에 기입한 정보를 바탕으로 파일이 만들어지고 `./posts/` 폴더의 하위에도 life란 이름의 폴더가 새로 만들어지게 됩니다.  
그 덕분에 사용자는 아래와 같이 config 파일에 페이지를 추가하기만 하면 될 수 있게 하였습니다.

```js
//user-meta-config.js
const pageMetadata = {
  //menu - Please enter a menu link to add to the navbar.
  //If you do not want to add a link to the navbar, you can leave it blank.
  menu: [
    { path: '/', linkname: 'Home' },
    { path: '/projects', linkname: 'Projects' },
    { path: '/develop', linkname: 'Develop' },
    { path: '/life', linkname: 'Life' }, // 새로 추가!
  ],
  //directorys - Enter the directory to be mapped with the page.
  //That directory is automatically linked to the gatsby filesystem.
  directorys: ['develop', 'projects', 'life'], // life 추가
}
```

### 쉬운 포스트 탐색을 위한 사이드바 및 포스트검색기능

![sidebar](../FE/Gatsby-starter-oasis-img/sidebar.gif '#width=50%')  
위와같이 페이지 별로 관심사를 분류하는것 만으로는 부족한것 같아 사이드바를 통해 세부적으로 분류된 포스트를 볼 수 있게 하였고 현재 어느 카테고리의 포스트를 읽고있는지 알 수 있게 하이라이트 기능을 추가하였습니다.
또한 제목 및 태그를 기반으로 검색할 수 있는 검색창도 추가하였습니다.

### 통합된 Config File

사용자가 초기에 블로그를 자신의 정보로 세팅할때 불편함이 없도록 사용자 기본정보는 물론 Google이나 Naver의 Search console verification code나 Google analytics tracking ID등을 `user-meta-config`이라는 설정파일 안에서 모두 설정할 수 있도록 하였고 프로필 이미지와 favicon은 지정된 이름 (favicon, profile) 으로 `./assets` 폴더에 넣으면 자동 적용되도록 하였습니다.

## Learned it

작성중입니다.
