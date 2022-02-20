---
title: 'Express asyncHandler로 에러 처리하기'
date: '2021-08-18'
tags: 'Express,async,asyncHandler,에러처리,비동기'
---

Express 프레임워크를 사용하여 서버를 만들때 나는 DB 쿼리실행과 같은 비동기 작업때 async/await 구문을 사용하고자 하였다.
async/await 는 ECMAScript2017 추가되어 **기존 promise를 사용했을 때보다 더 읽기 쉽도록 만들어 준다.**  
아래는 나의 프로젝트에 쓰인 코드로 같은 비동기 작업에서의 async/await 와 promise 표현방식이다.

```js
//device.js

//등록기기조회 promise
router.get('/regist', verifyToken, (req, res, next) => {
  db.getDevices(req.query)
    .then((result) => {
      if (isEmpty(result)) {
        throw new createError.BadRequest('등록기기 없음')
      }
      res.status(200).json({ success: true, devices: result })
    })
    .catch((error) => {
      next(error)
    })
})

//등록기기조회 async/await
router.get(
  '/regist',
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const result = await db.getDevices(req.query)
    if (isEmpty(result)) {
      throw new createError.BadRequest('등록기기 없음')
    }
    res.status(200).json({ success: true, devices: result })
  })
)
```

위의 코드에서 async/await를 사용할떄 추가로 **asyncHandler 이라는 랩퍼 메서드를 사용하였는데** 그 이유는 Express는 async 메서드의 에러를 감지하지 못하기 때문이다. 내가 사용한 모듈인 [express-async-handler](https://github.com/Abazhenov/express-async-handler/blob/master/index.js) 의 내부 코드를 보면 내부적으로 Promise 객체를 리턴하는것을 볼 수 있다.

```js
const asyncUtil = (fn) =>
  function asyncUtilWrap(...args) {
    const fnReturn = fn(...args)
    const next = args[args.length - 1]
    return Promise.resolve(fnReturn).catch(next)
  }

module.exports = asyncUtil
```

이렇게 asyncHandler 을 이용하여 에러 처리를 한 뒤에는 일반적인 에러를 구분해 맵핑을 해놓았다.

```js
//app.js

//일반적인 에러 매핑
const newErrorMap = new Map([['ER_NO_DEFAULT_FOR_FIELD', 400]])

//매핑 에러핸들러
app.use((err, req, res, next) => {
  const newError = newErrorMap.get(err.code)
  if (newError) {
    err.status = newError
    next(err)
  } else {
    next(err)
  }
})

//최종 에러핸들러
app.use(function (err, req, res, next) {
  //에러응답
  res.status(err.status || 500)
  res.json({ error: err, success: false })
})
```

위의 코드는 라우터에서 `ER_NO_DEFAULT_FOR_FIELD` 에러가 catch 될 경우 res 상태코드를 400으로 하여 응답하는 예시이다.

내가 서버를 구축할땐 위와 같은 방법으로 에러 처리를 하였고 더 깔끔하고 우아한 방법이 있을 것도 같다..
