---
title: 'Jenkins 에서 Github branch 별로 WebHook 설정하기'
date: '2021-09-29'
tags: 'SpringBoot,Jenkins,Docker,CI,CD,WebHook,Git,Branch'
---

지난 포스팅에서 SpringBoot 프로젝트를 Jenkins 를 이용하여 Docker Image 기반으로 수동으로 배포하는 법을
소개하였다. [**SpringBoot + Jenkins + Docker 로 CI/CD 구성하기**](https://je0ngyun.github.io/devops/spring-boot-jenkins-ci-cd)  
이번 포스팅에서는 수동으로 Jenkins 에서 빌드하여 배포하던 프로세스를 Github 에서 특정 Branch로 Push 이벤트가 발생시 자동으로 빌드하는 방법을 적용해 보려고 한다.

기본적으로 Jenkins 에서 지원하는 `GitHub hook trigger for GITScm polling` 를 이용하여 Webhook 설정을 할 경우에 모든 Branch push 이벤트에 대하여 Jenkins build 가 Trigger 되기 때문에 특정 Branch의 push 이벤트에서만 Jenkins build 를 원할 경우에는 `Jenkins Generic Webhook Trigger` 라는 플러그인을 이용하여야 한다.

# Jenkins에서의 수행 부분

먼저 Jenkins 대시보드에서 Plugin Manager로 들어가서 `Jenkins Generic Webhook Trigger` 플러그인을 설치해주도록 하자.

<img src="https://user-images.githubusercontent.com/33706043/135808977-f8e9bdba-6717-442d-be03-a90e71345892.png" width="80%">

성공적으로 설치를 진행해준 뒤에는 자신의 **Jenkins Item -> 구성 -> 빌드유발에서** `Generic Webhook Trigger` 를 체크해주도록 하자.

이어서 WebHook으로 넘어온 페이로드에서 사용할 값을 설정해 주도록 해야한다. 예시로 WebHook을 통해 Jenkins로 전달되는 페이로드는 다음과 같다.

<img src="https://user-images.githubusercontent.com/33706043/135811245-326bafa6-95cc-4268-b97c-424b1f37b3e0.png" width="60%">

위의 페이로드에서 ref 값을 통하여 Branch 를 구분할 수 있게
`Post content parameters`를 다음과 같이 추가하도록 한다.

<img src="https://user-images.githubusercontent.com/33706043/135810733-a3f8a376-7ee8-4c10-99a8-3b1253e6e5e4.png" width="60%">

그리고 Jenkins Item 을 구분할 수 있는 Token String 를 입력해준다.
이 Token String는 후에 GitHub WebHook URL 의 QueryString 으로 사용된다.

<img src="https://user-images.githubusercontent.com/33706043/135826432-dec11c03-c367-4612-8d83-a8c2040dbe93.png" width="80%">
 
마지막으로 Optional filter 를 통하여 WebHook 을 Trigger 할 branch를 설정한다.
자신이 push 시 Jenkins build 를 원하는 브런치를 아래와 같은 형식으로 적어주면 된다.

<img src="https://user-images.githubusercontent.com/33706043/135827462-834354a9-e150-401a-9dfd-ad206ea0f98d.png" width="90%">

위의 과정을 전부 성공적으로 마쳤다면 Jenkins 에서 설정할 부분은 끝났다. 다음은 Github 에서
Webhook URL 을 등록해주자.

# Github에서의 수행 부분

자신의 **Repository -> Settings -> Webhooks -> Add webhook** 을 클릭하여 아래와 같이 입력해 주자.

<img src="https://user-images.githubusercontent.com/33706043/135855302-a540f853-0e49-48d2-8034-e622e6e56bf9.png" width="70%">

Payload URL 은 Repository 에서 push 이벤트 발생시 Jenkins 서버로 Post 요청을 보낼때 사용할 타겟 URL 이다.  
`http://자신의서버주소:포트/generic-webhook-trigger/invoke?token=자신의토큰` 형식으로 기입해주도록 한다.
그 아래에 Content Type은 반드시 application/json 를 선택해 주도록 한 후 WebHook을 생성을 마무리한다.

이제 모든 과정은 끝났다. 이제 Push 시에 Github 에서 Jenkins 서버로 Post 요청을 수행하며 Post 요청을 받은 Jenkins가
페이로드의 ref 값을 확인하여 자신이 설정한 Branch 일 경우에만 Build를 수행하는 과정을 거치게 되었다. 자신이 설정한 Branch로 Push를 진행하여 테스트 해보도록 하자.

진행하면서 문제가 있는경우 덧글 남겨주시기 바랍니다! 🙇
