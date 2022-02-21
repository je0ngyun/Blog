---
title: '10Plus-Server'
date: '2021-07-22'
tags: '스마트홈 중계서버'
tech: 'NodeJS,Express,Socket.io,MQTT,UDP,Jwt,MySql'
period: '2021.03 ~ 2021.05'
desc: 'IoT 기기들을 관리하고 동작시키며 웹서버와 각 IoT 기기를 연결하는 중계서버;Express 프레임워크를 이용하여 개발;MySQL DB를 사용하여 각 기기 정보를 유지;토큰 기반 인증 방식을 적용;IoT 기기들과의 통신에 MQTT 프로토콜을 사용;인증코드 표출 이벤트를 위해 WebSocket을 사용;RaspbianOS 위에서 실행되며 사용자의 가정에 설치;팀구성 -- 1인'
---

## 목차

> - [개요](#프로젝트-개요)
> - [시스템구성도](#시스템구성도)
> - [중계서버](#중계서버)
> - [사용기술](#사용기술)
> - [주요기능](#주요기능)
> - [API Document](#API-Document)

## 프로젝트 개요

본 프로젝트는 웹 통신을 이용한 IOT 스마트홈 구축 이란 주제로 잔행된 **2021 캡스톤디자인 프로젝트 중 서브프로젝트** 입니다.  
프로젝트의 **목표는 기존 거주지의 스마트홈화** 이며 이러한 목표에 맞게 사용자가 이용하는 IOT 기기, 웹사이트, 가정에 설치되는 인터폰 형식의 스마트 디바이스를 제작하였습니다.  
본 글에서 설명하는 프로젝트는 사용자의 집에 설치되는 **스마트 디바이스인 동시에 중계서버** 역할을 수행하는 프로그램입니다. 개발 기간은 2개월이 소요되었으며 1인 개발로 진행하였습니다.

코드는 [**GitHub 에서**](https://github.com/je0ngyun/10PlusServer/tree/master/APIserver) 보실 수 있습니다.

## 시스템구성도

시스템 구성도는 다음 사진과 같습니다.

<img width="80%" alt="system" src="https://user-images.githubusercontent.com/33706043/144782710-fb8491a1-9a0e-46a9-9c84-13010e34b395.png">

프론트엔드와 백엔드 부분으로 나누어 서비스 페이지와 백엔드 서버를 구성하였습니다.  
클라이언트로부터 기기관련 요청을 받았을때 해당 중계서버로 백엔드 서버에서 요청을 보냅니다.  
요청을 받은 중계서버는 각 IoT 기기와 MQTT 프로토콜로 통신합니다.

## 중계서버

웹 통신 특성상 외부에서 **하나의 호스트 주소로 여러 기기를 운용할 수 없다** 판단되어 중계서버를 도입하였습니다.  
외부에서 각 IoT 기기를 작동시키기 위해 모두 포트포워딩하여 관리하는 방법은 비효율적이라고 생각하였습니다.  
대신 가정집에 인터폰 형식의 중계서버를 배치하고 중계서버가 IoT 기기들과 내부망에서 통신을 하는 형식으로 결정하였습니다.

## 사용기술

<span>
<img alt="Express" src ="https://img.shields.io/badge/Express-001039.svg?&style=for-the-badge&logo=Express&logoColor=white"/>
</span>
<span>
<img alt="MySQL" src ="https://img.shields.io/badge/MySQL-4479a1.svg?&style=for-the-badge&logo=MySQL&logoColor=white"/>
</span>
<span>
<img alt="JWT" src ="https://img.shields.io/badge/JWT-291345.svg?&style=for-the-badge&logo=JsonWebTokens&logoColor=white"/>
</span>
<span>
<img alt="MQTT" src ="https://img.shields.io/badge/MQTT-3c5280.svg?&style=for-the-badge&logo=EclipseMosquitto&logoColor=white"/>
</span>
<span>
<img alt="Knex" src ="https://img.shields.io/badge/Knex-566179.svg?&style=for-the-badge&logo=Known&logoColor=white"/>
</span>
<span>
<img alt="SocketIO" src ="https://img.shields.io/badge/Socket.io-189472.svg?&style=for-the-badge&logo=Socket.io&logoColor=white"/>
</span>

**Express - v4.16.1**

- Express 프레임워크를 이용하여 Node 환경에서 서버를 구성하였습니다.

**MySQL - v5.7.32**

- 기기관련 정보를 저장하기 위해 MySQL DB를 사용하였습니다.

**JWT - v8.5.1**

- 사용자 인증을위해 토큰인증방식을 채택하였습니다.

**MQTT(Ades-broker) -v0.46.0**

- 각 IOT기기와의 통신을 위해 MQTT 프로토콜을 사용하였습니다.
- 브로커로 Ades 브로커를 사용하였습니다.
- 중계서버가 하나의 브로커 역할을 수행하도록 개발하였습니다.

**Knex(QueryBuilder) -v0.95.4**

- DB쿼리를 실행하기위해 Knex 쿼리빌더를 사용하였습니다.

**Socket-io -v4.0.1**

- 연결된 웹에 이벤트(인증코드 표출)를 발생시키기 위해 웹소켓을 사용하였습니다.

## 주요기능

### **기기등록**

기기등록은 다음과 같은 단계를 거칩니다.

1.  초기에 IOT기기 전원작동시 내부망으로 UDP 메시지를 브로드캐스팅합니다.
2.  중계서버가 브로드캐스팅된 메시지를 받으면 중계서버의 Host주소를 메시지에 담아 응답합니다.
3.  IOT기기가 중계서버의 Host 주소로 각 MQTT 토픽 구독과 발행을 진행합니다.
4.  IOT기기가 발행한 정보에 따라 중계서버의 DB에 기기정보를 저장합니다.

기기등록기능과 관련된 MQTT

```
topic-name : registTopic
action : subscribe
message : 기기호스트,기기이름,기기전원갯수(구)
```

### **기기동작요청**

기기동작은 다음과 같은 단계를 거칩니다.

1.  중계서버가 특정 기기작동 웹 요청을 받았을때 MQTT 기기동작 토픽을 발행합니다.
2.  IOT기기가 중계서버가 발행한 토픽에 대한 정보로 스위치를 작동시킵니다.
3.  IOT기기가 현재 기기의 상태의 정보를 담아 토픽을 발행합니다.
4.  중계서버가 IOT기기의 현재 상태를 JSON형식으로 웹 요청에 대해 응답합니다.

기기동작기능과 관련된 MQTT

```
중계서버 -> IOT기기

topic-name : "기기호스트주소"/action
action : publish
message : 스위치번호
```

기기동작기능과 관련된 HTTP

```
웹서버 -> 중계서버

method : GET
url : device/action
request-header : x-access-token(token)
request-query : host,switch
response-body : success(boolean),device(object)
```

### **기기로그관리**

중계서버는 각 **기기상태가 변화할때마다** 다음과 같은 DB테이블에 상태를 저장합니다.

<img src = "https://user-images.githubusercontent.com/33706043/154886608-0c8de80d-381b-424c-9c31-e69c6911648b.png" width="80%">

DB 쿼리실행을 위해 쿼리빌더(Knex 라이브러리)를 이용하였습니다.

### **사용자인증**

사용자 인증방식은 **토큰기반 인증방식** 을 채택하였습니다.  
사용자 토큰 발급 은 다음과 같은 단계를 거칩니다.

1. 사용자가 스마트 디바이스 메인화면에 표출된 중계서버의 외부주소를 입력하여 해당주소로 장소등록을 요청합니다.
2. 요청을 받은 중계서버는 인증번호를 생성하고 연결된 웹에 인증코드 표출 이벤트를 보냅니다.
3. 사용자가 인증번호를 확인하고 입력하여 중계서버에 확인 요청을 보냅니다.
4. 인증코드가 정상적으로 확인될 경우 중계서버는 토큰을 담아 응답합니다.

위와같은 인증 절차를 사용한 이유는 **사용자가 집에 설치된 스마트디바이스** 만으로도 **로그인 없이**
연결된 각 IOT기기들을 사용할 수 있게 하기 위해 육안으로 인증번호를 확인하여 입력하는 방식을 채택하였습니다.  
이로써 사용자가 각 IoT기기들을 작동시킬수 있는 방법으로 두 가지 방법을 제공하게 되었습니다.

1. **웹 페이지에 접속해 로그인을 한 후 각 IoT 기기동작요청**
2. **집에 설치된 스마트디바이스(라즈베리파이) 로 각 IoT 기기동작요청**

아래의 이미지는 위의 단계를 나타낸 것 입니다.</br>

<img src = "https://user-images.githubusercontent.com/33706043/154886681-271914a4-dc28-420b-8654-f867507f81f5.png" width="80%">

## API Document

<img src = "https://user-images.githubusercontent.com/33706043/144789602-1f93dd3d-53b3-4d5e-9c02-920fa32e3d41.png" width="80%">
