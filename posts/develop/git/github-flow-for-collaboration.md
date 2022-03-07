---
title: '협업을 위한 Github flow'
date: '2022-03-08'
tags: 'Git,Github,Collaboration,Flow,Strategy'
---

그동안의 협업에서는 branch 전략, issue, pull request를 제대로 활용하지 못했었다. 당시에는 Git이 익숙치 않았기 때문에 collaborator를
이용한 협업만 진행했었다.
이젠 취업시기가 다가옴에 따라서 협업을 위한 지식이 좀 더 필요하다고 생각하여 후에 내가 협업을 진행하게 된다면 어떻게 구성해야 하는지를 미리 정리해보는 시간을 가져보려고 한다.

## Github flow?

기존 Git의 flow의 복잡성때문에 GitHub에서 사용하기 어렵다는 이유 때문에 등장한 개념이다.
기존 Git flow를 단순화 시킨만큼 master branch에 대한 규정만 엄격하게 관리하고 나머지 branch에 대해서는 관여하지 않는다.
대신 master branch는 항상 최신 상태가 유지되어야 함과 동시에 항상 배포 가능하여야 한다. 자세한 내용은 아래와 같다.

### 언제든 master branch를 배포할 수 있어야한다.

- master branch는 항상 배포가능해야하기 때문에 항상 최신상태를 유지하여야한다.
- master branch는 안정화 상태여야하며 그렇기 때문에 엄격한 role를 적용한다.

### master branch로부터 descriptive한 branch가 뻗어나올 수 있다.

- descriptive 하다는 것은 명확한 이름을 가져야한다는 것이다.
- branch 이름만으로 어떠한 일을 할 수 있는지 알 수 있어야한다.

### 지속적으로 원격지 branch에 push한다.

- 항상 원격지에 코드를 올려 다른사람들이 확인할 수 있게 한다.
- 지속적인 push는 코드 백업에 도움이 된다.

### 코드리뷰나 피드백등 도움이 필요할때 및 코드가 merge될 준비가 끝났다면 pull request를 생성한다.

- 자신의 코드가 merge될 준비가 끝났다고 생각하면 pull request를 생성한다.
- pull request를 통하여 코드를 공유하고 리뷰 받는다.

### pull request에 대한 충분한 검토후에 merge를 허락한다.

- merge는 여러 사람들과의 충분한 검토후에 이루어져야한다.
- product로 반영이될 기능이기에 신중하게 검토하자.

### master branch의 push시에는 즉시 배포되어야 한다.

- Github flow의 핵심으로 자동화를 통해 지속적 배포한다.
- Jenkins Hubot Netlify등 툴들을 활용한다.

## Strategize

Github flow를 알았으니 다음 협업을 위한 전략을 간단하게나마 미리 세워보려고 한다.  
Github flow의 핵심인 자동화는 개인적으로 프론트엔드 개발시에 [Netlify](https://www.netlify.com/)가 사용성이 좋았기에 다음에도 이용할 것 같다.  
아래는 간단히 생각해본 흐름이다.

![flow](./github-flow-for-collaboration-img/flow.png '#width=70%')

1. **개발을 위한 branch인 develop 브런치를 생성한다.**

2. **개인이 작업할 내용을 issue에 올린다.**

   - issue를 활용하면 프로젝트의 진행상황을 한눈에 볼 수 있다는 장점이 있다.
   - issue template, label등을 적극 활용해 보려고 한다.
   - 팀원들과 소통을 통해 issue 컨벤션을 정하자!

3. **develop branch로부터 자신이 작업할 branch를 생성한다.**

   - 개인 작업을 위한 branch 생성전 develop branch를 pull한다.
   - 이 부분도 팀원끼리 상의를 통해 branch 이름에 대한 컨벤션을 정할 필요가 있다.
   - 예시로 이름-#이슈번호 등으로 생성할 수 있을 것 같다.

4. **작업이 끝나면 PR을 날린다.**

   - 자신이 작업햇던 branch를 develop branch로 merge 한다.
   - 연관된 issue 번호를 태그한다.

5. **정기적으로 develop branch를 master로 merge해 배포한다.**

## 협업..

**나중에 협업할 기회가 생긴다면 어떻게 전략을 세워야 할까?** 로부터 시작된 블로그 포스팅이었다.  
협업이란게 팀원들과의 소통을 통해 많은 컨벤션을 세워야 한다고 생각한다. 그래도 이렇게 간단하게나마 전략을 세워보면서
이전까지는 어떻게 진행해야 깔끔할까? 라고 생각했던 협업에 대해 조금은 답을 찾은 것 같다.  
사실 여러 기능이나 아이디어에 대해 사람들과 이야기하는것도 좋아하고 그래서 협업도 좋아하지만
최근들어 혼자 1인 프로젝트만 진행하다보니 잠시 협업과 동떨어진 개발을 했던 것 같다. 협업을 할 수 있는 기회는 내가 찾는 것 이라고 생각하기에 앞으로 많이 찾아보아야겠다.
