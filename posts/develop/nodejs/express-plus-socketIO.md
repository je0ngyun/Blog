---
title: 'Express + Socket.io 같은 포트로 구성하기'
date: '2021-08-11'
tags: 'Express,Socket.io,서버,웹소켓,인증코드,인증'
---

2021-1 학기에 웹 통신을 이용한 IOT 스마트홈 구축이란 주제로 프로젝트를 진행했었다. 나는 중계서버 제작을 맡아서 했었는데
이때 우리가 구성한 중계서버는 사용자의 집에 인터폰과 같은 형태로 설치가 되고 외부에서 중계서버를 통하여 집에 있는 각 IoT 기기들을 조작하는 방식이었다.

중계서버를 구성한 이후에 나는 인증방식을 어떻게 해야할지 고민이 많았었다. 첫번째로 로그인을 통한 인증이 있는데 이와같은 방법을 사용할 경우에는 사용자가 인터폰을 통하여 기기를 조작하기 위해 따로 로그인을 해야하는 번거로움이 생겼다. 그래서 우리는 사용자의 편의성을 생각하여 다음과 같은 인증 절차를 밟게 하였다.

> 1. 먼저 사용자의 집에 설치된 인터폰과 같은 형태의 중계서버가 설치되어 직접 집안의 기기들을 관리 가능
> 2. 웹 사이트를 통하여 로그인 후 장소등록 기능을 통해 집에 설치된 중계서버에 인증코드표출 요청을 보냄
> 3. 표출된 인증코드를 입력하여 집에설치되어있는 중계서버와연결

이와같은 절차를 통하여 사용자는 외부에서 우리가 제공하는 웹사이트에서 로그인을 통하여 각 기기들을 조작 할 수 있고
집에서도 마찬가지로 웹사이트 혹은 집에설치된 중계서버를 통하여 각 기기들을 조작 할 수 있게 하였다.

나는 위 프로젝트에서 중계서버 부분을 맡았기 때문에 위와같이 인증코드를 통해 인증하는 시스템을 구축하기위해서 웹 소켓을 사용하게 되었으며 **Express 서버와 웹소켓 서버를 같은 포트로 열어야만 했고** 다음과 같은 방법을 사용하였다.

우선 내가 사용하는 웹 소켓 모듈인 Socket.io를 다음과 같이 **Express 객체에 연결**하였다.

```js
//app.js
...

var app = express();
app.io = require('socket.io')(); //socket.io 추가

...

//웹소켓 커넥션 핸들러
app.io.on('connection', function (socket) {
  console.log(`WebSocket Connected to the Client`);
});
app.set('socketIO', app.io); //router 에서 사용하기위해 등록
```

그 후 실질적으로 서버가 생성되는 Express 의 WWW 안에서 다음과 같이 **웹소켓 서버도 실행**되도록 해주었다.

```js
//WWW
...

var server = http.createServer(app)
app.io.attach(server, {
  cors: {
    origin: "http://localhost:80",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
}) //http 서버에 socket.io 연결
```

이렇게 Express와 socket.io를 동시에 열면 **라우터에서** 다음과 같이 사용할 수 있다.

```js
// auth.js

//인증코드 화면에 표시
router.get('/code', (req, res, next) => {
  const io = req.app.get('socketIO') //socket.io 인스턴스 가져오기
  const code = authCode.createCode()
  io.emit('code', code + '') // 연결된 웹앱에 인증코드 표출 이벤트 전달
  res.json({ success: true }) // 이 응답은 요청 클라이언트로의 응답
})

//인증코드 확인후 토큰 발행
router.post(
  '/codecheck',
  asyncHandler(async (req, res, next) => {
    if (isEmpty(authCode.getCode())) {
      throw new createError.Unauthorized('만료된 코드')
    }
    if (req.headers.code != authCode.getCode()) {
      throw new createError.Unauthorized('잘못된 인증코드')
    }
    const token = jwt.sign(
      {
        api_serial: env.serial,
      },
      env.secret_key,
      {
        expiresIn: '30h',
      }
    )
    res.status(201).json({ success: true, token: token })
  })
)
```
