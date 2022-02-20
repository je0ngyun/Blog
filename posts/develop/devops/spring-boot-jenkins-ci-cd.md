---
title: 'SpringBoot + Jenkins + Docker 로 CI/CD 구성하기'
date: '2021-09-28T12:01+0900'
tags: 'SpringBoot,Jenkins,Docker,CI,CD,배포'
---

최근 SpringBoot 프로젝트를 진행하면서 **CI/CD** 를 구성해 보았는데 그 과정을 기록해 보고자 한다.  
일단 내가 생각한 아키텍처는 다음과 같다.  
내가 보유중인 서버가 Oracle 무료 인스턴스 하나 뿐이었기에
하나의 서버를 이용하는 방식으로 구성하였다. 파란색 사각형은 **도커 컨테이너** 이다.

<img src = "https://user-images.githubusercontent.com/33706043/135707701-84f7e841-e979-43e0-a981-87bdc7786b68.png" width="70%">

1. **로컬에서 개발 및 Junit 테스트 수행**
2. **Github push**
3. **Jenkins 에서 push 된 정보를 가지고 빌드 및 Docker 컨테이너 생성 (배포)**

# Spring Boot 프로젝트 설정 및 Github Push

먼저 로컬에 존재하는 프로젝트에서 다음과 같은 설정을 해주도록 하자.

1. build 시 plain.jar 생성을 하지 않게 하기 위해 다음을 `build.gradle` 에 추가한다.

```text
jar {
	enabled = false
}
```

2. `application.yml (설정파일)` 에서 서버주소와 포트를 설정한다. localhost로 설정할경우 외부 접속이 되지 않을 수 있기때문에 다음과 같이 설정하였다.  
   참고로 github 에서 public repo 로 구성했을 경우에는 설정파일의 민감한 키 값이 유출 될 수 있기 때문에 private repo 로 구성하거나 public repo 를 유지하면서 Docker container 에서 외부 설정파일을 주입 받는 것으로 해결할 수 있다.  
    외부 설정파일을 주입 하는 방법은 추후에 적용하기로 하고 일단 진행하도록 하겠다.

```yml
server:
  address: 0.0.0.0
  port: 8080
#... 이하 생략
```

3. 프로젝트 최상위 디렉토리에 다음과 같은 `Dockerfile`를 추가한다. 추후에 젠킨스 컨테이너에서 빌드 후에 도커 image를 만들때 사용된다.  
   참고로 최상위 디렉토리는 build.gradle가 있는 위치이며
   파일 이름은 `"Dockerfile"`로 생성한다.

<img src = "https://user-images.githubusercontent.com/33706043/135720938-cdd40c73-2cd2-4710-8749-18f6836e3497.png" width="40%">

```txt
FROM java:8
EXPOSE 8080
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

Java 8 이미지 기반으로 빌드된 jar 파일을 구동시켜주는 이미지를 생성하는 dockerfile 이다.  
위와 같은 설정을 해준 후에 자신의 Github repo 에 push 하자.  
나는 배포용 브런치를 따로 만들어서 push 하였다.

# 서버에 Docker 설치 및 Jenkins Container 실행

배포가 진행될 서버에 Docker를 설치해보자.

```shell
//docker 설치
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh
$ sudo usermod -aG docker $USER //현재접속중인 user, 따로 지정할 경우 username 입력

//docker-compose 설치
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```

Docker를 설치한 이후에는 **Jenkins container** 내부의 디렉토리와 매핑될 디렉토리를 생성한다.

```shell
sudo mkdir jenkins_home
sudo chown 1000 jenkins_home
```

그 다음 **Jenkins image** 를 준비해준다.

```shell
docker pull jenkins/jenkins
```

Jenkins image 를 준비한 후에 Jenkins 컨테이너를 실행할 `docker-compose.yml` 를 작성해준다.

```shell
sudo touch docker-compose.yml
sudo vi docker-compose.yml

# 아래과 같은 내용 기입 후 저장
version: '3.1'
services:
  jenkins:
    restart: always
    container_name: jenkins
    image: jenkins/jenkins
    ports:
      - "9090:8080"
    volumes:
      - "$PWD/jenkins_home:/var/jenkins_home"
      - "/var/run/docker.sock:/var/run/docker.sock"

```

컨테이너 이름을 **jenkins** 로 하고 컨테이너 내부의 8080 포트를 서버의 9090 포트로 매핑 및 좀전에 만든 현재 디렉토리의
`jenkins_home` 디렉터리와 컨테이너의 내부의 `/var/jenkis_home` 디렉터리를 매핑하는 컨테이너를 실행시킬수 있게하는 파일이다.  
`"/var/run/docker.sock:/var/run/docker.sock"` 를 통해 jenkins 컨테이너에서 **DooD 방식**으로 도커에
접근 할 수 있게 한다. **DooD 방식이란 Docker 컨테이너 내부에서 외부 Docker Socket 를 사용하는 방식이다.**
(로컬의 도커와 젠킨스 내에서 사용할 도커 엔진을 동일한 것으로 사용)  
DooD 방식과 DinD 방식의 자세한 차이점은 구글 검색을 통해 알아보도록 하자..

이제 다음의 명령으로 jenkins 컨테이너를 실행시킨 후 `docker ps -a`를 통하여 정상적으로 실행 되었는지 확인하여 보자.

```shell
docker-compose up -d
docker ps -a
```

<img src="https://user-images.githubusercontent.com/33706043/135722215-589dfbac-8285-4ab2-bc0a-546ed209c7eb.png" width="80%">

위와같이 jenkins 컨테이너가 성공적으로 실행 된 뒤에는 jenkins 컨테이너에 접속해준다.
컨테이너ID 는 `docker ps -a` 를 통하여 확인 가능하다.

```shell
docker exec -it -u root {컨테이너 ID} bash
```

jenkins 컨테이너에 접속한 다음엔 다음과 같은 작업을 해주자.

1. **초기 /var/run/docker.sock의 권한이 소유자와 그룹 모두 root이기 때문에 root에서 docker로 변경.**

```shell
/usr/sbin/groupadd -f docker
/usr/sbin/usermod -aG docker jenkins
chown root:docker /var/run/docker.sock
```

2. **컨테이너 내부에서 docker 명령을 사용하기 위한 docker-ce 설치** (아래 명령 전체 복사해서 붙어넣기 하면 된다)

```shell
apt-get update && \
apt-get -y install apt-transport-https \
  ca-certificates \
  curl \
  gnupg2 \
  zip \
  unzip \
  software-properties-common && \
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
add-apt-repository \
"deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
$(lsb_release -cs) \
stable" && \
apt-get update && \
apt-get -y install docker-ce
```

위 두가지의 작업을 해준 뒤에는 exit 명령어로 컨테이너 bash 에서 나와주도록 하자.  
이제 Jenkins 를 사용하기 위한 모든 준비가 끝났다. 본인이 사용하는 서버의 9090 포트로 접속을 해보도록 하자. 접속이 되지 않는다면 본인이 사용하는 인스턴스에서 포트포워딩이 되었나 확인해 보자.  
나는 jenkins 를 위한 9090 포트와 SpringBoot 프로젝트를 위한 8080 포트를 미리 포워딩 해놓았다.

<img src="https://user-images.githubusercontent.com/33706043/135723114-2600707e-b108-4edc-8283-92df4901e70d.png" width="80%">

# Jenkins 로그인 및 프로젝트 추가

jenkins 에 접속하면 아래와 같은 초기화면이 보인다.

<img src="https://user-images.githubusercontent.com/33706043/135737253-7e4c687a-233f-491f-89bc-44bba075c57a.png" width="80%">

맵핑했던 `jenkins_home` 폴더에 secret key 가 저장되어 있다. 확인해 보도록 하자.

```shell
cat jenkins_home/secrets/initialAdminPassword
```

정상적으로 secret key 가 입력되었다면 아래와 같은 화면을 볼 수 있다.

<img src="https://user-images.githubusercontent.com/33706043/135741631-be38017f-69c3-46f0-bc32-299529ad6980.png" width="80%">

`Install Suggested Plugins` 를 클릭하여 모듈들을 설치해 주도록 하자.
모듈이 설치된 이후에는 Admin User 를 생성할 수 있는 페이지가 나온다 계정을 생성해 주고
계속 진행하여 마무리 하면 아래와 같은 젠킨스 메인화면이 나온다.

<img src="https://user-images.githubusercontent.com/33706043/135741968-dee2bda7-ce00-453f-8559-3665f0967589.png" width="80%">

대시보드에서 새로운 item 을 선택한뒤 아래 사진처럼 프로젝트명을 기입하고 Freestyle project로 선택하여
생성해준다.

<img src="https://user-images.githubusercontent.com/33706043/135742084-003374fb-9c02-42b6-a9f4-815591c62e6a.png" width="70%">

다음 세부설정의 소스 코드 관리 탭에서 Git으로 선택하고 Repository URL에 자신의 Repository 주소를 기입하고
Credentials 에서 Add 버튼을 눌러서 Jenkins 를 선택한다.

<img src="https://user-images.githubusercontent.com/33706043/135805515-50aac082-b5f8-47cf-872c-6875c03633de.png" width="80%">

그다음 아래와 같이 Username 에 자신의 Github ID, Password 에 깃허브에서 생성한 엑세스 토큰, Credential ID, Description 을 기입하고 확인을 누른다.

<img src="https://user-images.githubusercontent.com/33706043/135805582-c158d506-6c39-4ecd-a871-bd75a56b675b.png" width="80%">

토큰은 Github Settings -> Developer settings -> Personal access tokens 로 들어가서
Generate new token 버튼을 클릭하여 만들수 있다.

<img src="https://user-images.githubusercontent.com/33706043/135742859-daaf512c-4ff5-4e84-92b5-646805b67cde.png" width="80%">

(Generate new token 버튼 클릭 후)

<img src="https://user-images.githubusercontent.com/33706043/135804400-8e415ec5-afa6-4a0c-81b4-d54575574ca5.png" width="80%">

<img src="https://user-images.githubusercontent.com/33706043/135804463-df2d0eed-b7af-49a7-acd9-1191268cde7f.png" width="80%">

위와 같이 **Note(공백없이), Expiration, Select Scope** 를 설정한후 token을 생성한다.

이어서 Build 를 진행할 Branch를 기입하고 Additional Behaviours 눌러서 Update tracking submodules to tip of branch 에 체크해주자.

<img src="https://user-images.githubusercontent.com/33706043/135807578-b6714e0c-62ee-478a-99ab-137f313ca32e.png" width="80%">

나는 public repo 였기 때문에 위와같은 방법을 적용하였지만 자신의 프로젝트가 priavate 일 경우에는 SSH key를 이용하여
연동해야하므로 조금 더 복잡하다.  
SSH key를 통한 연동 방법을 다룬 좋은 블로그가 있어서 링크 하도록 하겠다.  
[**Jenkins와 Github 연동하기 - 3. Private Repository**](https://mingzz1.github.io/development/basic/2021/04/19/jenkins_with_private_repo.html/)

다음으로 **Build 탭**에서 **Add build step**를 클릭후 **Excute shell**를 선택하여 다음과 같은 명령을 하나씩 입력해 주자.

<img src="https://user-images.githubusercontent.com/33706043/135743703-5c2f30bf-fada-4498-a628-56ad32d609dd.png" width="80%">

<img src="https://user-images.githubusercontent.com/33706043/135743727-873818d2-31fa-4842-acd4-f9bfdda8362c.png" width="80%">

```shell
./gradlew clean build -x test
# 빌드시 test 수행을 원하면 ./gradlew clean build로 변경
```

동일한 방법으로 계속해서 아래 커맨드를 각각 추가해 주자.

```shell
docker build -t cardme-image .
# 현재 경로에 위치한 Dockerfile를 이용하여 cardme-image 라는 이미지를 생성
# 이미지 이름은 자신에게 적합하게 변경해 주면 된다.
```

```shell
value=$(docker ps -q --filter "name=cardme")

if [ -n "$value" ];then
    docker stop cardme
    docker rm cardme
fi

# 지속적으로 배포함에 따라 이미 실행중인 cardme 라는
# 이름의 컨테이너가 존재할 경우 삭제해주는 커맨드
```

```shell
docker run -p 8080:8080 -d --name=cardme cardme-image
# 방금 만든 cardme 이미지를 사용하여 cardme 라는 이름의 컨테이너를 실행
```

```shell
yes | docker image prune
# 여러번 배포 과정을 거치면서 동일한 이미지를 새로 생성할 경우
# 기존 남아있던 이미지는 dangling 상태
# dangling 된 이미지를 삭제하는 커맨드
```

위와 같은 커맨드를 전부 추가했다면 대시보드에서 **Build Now** 버튼을 눌러보자.

<img src="https://user-images.githubusercontent.com/33706043/135744725-d1bf894e-40a5-4e96-beda-cd57a323b551.png" width="80%">

빌드가 진행되며 **Build history** 에 표출된 빌드를 눌러서 들어가보면

<img src="https://user-images.githubusercontent.com/33706043/135744866-265b9579-54b5-4744-9933-72ae550dcc95.png" width="80%">

성공적으로 빌드와 배포가 완료되었다.
`자신의 서버주소:8080` 로 들어가서 스프링 프로젝트가 정상적으로 배포가 되었는지 확인해 보자.  
이렇게 하여 Github push 후 Build 버튼을 눌러 수동으로 배포 하는 과정까진 완료가 되었다.  
다음 글에서는 **WebHook을 이용하여 Github push 후에 자동적으로 배포** 하는 방법을 소개하도록 하겠다.

진행하면서 문제가 있는경우 덧글 남겨주시기 바랍니다! 🙇
