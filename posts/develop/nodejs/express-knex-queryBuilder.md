---
title: 'Express Knex 쿼리빌더를 이용하여 DB쿼리 실행'
date: '2021-08-14'
tags: 'Express,Knex,쿼리빌더,DB,MySQL'
---

웹 통신을 이용한 IoT 스마트홈 구축 이란 주제로 프로젝트를 진행하면서 각 기기들의 정보를 유지시키기 위하여 MySQL DB 를 사용하였었다. Nodejs 기반의 Express를 이용하여 API 서버를 제작 중이던 터라 Express에서 DB 쿼리를 실행하기 위한 몇가지 방법을 찾아 보았고 **크게 쿼리빌더 형식의 Knex와 ORM 방식의 Sequelize** 가 있다는 것을 알게 되었다.  
나와 같은 경우는 웬만한 SQL문을 작성 할 수 있었고 아직은 그렇게 작성하는 방식이 편했기 때문에 때문에 굳이 ORM 방식으로 새로 적응하는 것 보단 작성 방식이 좀 더 SQL쿼리다운?? Knex 쿼리빌더를 사용하게 되었다.

```js
// SQL
const query = 'SELECT * FROM device_log WHERE api_serial = 12'

// Knex
knex('device_log').select().where({ api_serial: 12 })

// Sequelize
models.DeviceLog.findAll({
  where: { api_serial: 12 },
})
```

위와 같이 Knex 쿼리빌더의 메서드체이닝을 이용한 쿼리 실행은 **일반 SQL 쿼리작성과 상당히 비슷하다.**
Knex를 사용하기로 결정한 후엔 설치를 하고 Knex 인스턴스를 만들었다.

```bash
npm install knex --save
```

```js
//dbConn.js
const env = require('./env/env.json')
const db = require('knex')({
  client: 'mysql',
  connection: {
    host: env.db_env.DB_HOST,
    user: env.db_env.DB_USER,
    password: env.db_env.DB_PASSWORD,
    database: env.db_env.DB_DATABASE,
  },
})

module.exports = db
```

위 코드와 같이 knex 인스턴스를 생성할 수 있고 connection 에 필요로 하는 정보는 보안을 위해 **별도의 env.json 파일을 작성하고 참조하여 제공하였다.**

그 후엔 생성한 knex 인스턴스를 이용하여 다음과 같이 DB쿼리를 작성하였다. knex를 통한 쿼리 작성 방법은 잘 정리되있는 사이트가([wspn-knex](https://github.com/wpsn/wpsn-knex/blob/master/queryBuilder.md)) 있어서 읽어본다면 쉽게 작성할 수 있다. 다음은 knex를 사용한 내 프로젝트 코드의 일부분이다.

```js
//dbModel.js

const env = require("./env/env.json")
const db = require("../common_modules/dbConn")
const self = {}

self.setDevice = async function (info) {
  let query = await db("device")
    .insert({
      device_host: info.device_host,
      device_name: info.device_name,
      api_serial: info.serial,
      way: info.device_way,
    })
    .toString()
  query +=
    " on duplicate key update " +
    db.raw("device_name= ?, api_serial = ?", [info.device_name, env.serial])
  await db.raw(query).then()
  await db("device_log")
    .where({ api_serial: env.serial, device_host: info.device_host })
    .update({ device_name: info.device_name })
    .then()
}

self.getDevices = async function (info) {
  try {
    let dbResult = await db("device")
      .select("api_serial", "device_host", "device_name", "way")
      .where({
        api_serial: info.serial,
      })
      .then()
    return dbResult
  } catch (ex) {
    console.log(ex)
  }
}
...//이하생략


module.exports = self;
```

개인적으로 knex 쿼리빌더를 사용해보면서 만족감을 느꼈다 매소드 체이닝을 통한 쿼리를 작성하는 방식이 직관적이라 보기에도 편하였고 일반 SQL문의 쿼리 작성과 유사함 + where 문과 같은 곳에서 객체로 전달 할 수 있는 방식이 맘에 들었다.  
추가로 Knex 의 raw 메서드를 통하여 쿼리를 직접 작성할 수 있는데 다음과 같은 **템플릿 리터럴을 이용한 쿼리작성은 자제해야한다.**

```js
// 주의!
const status = [1]
knex.raw(`status <> ${status}`)
// 이렇게 하면 절.대.로 안됩니다.
```

출처 : [wspn-knex](https://github.com/wpsn/wpsn-knex/blob/master/queryBuilder.md)  
**위와 같이 작성된 코드는 SQL injection 공격에** 무방비로 노출될 수 있다고 하며 직접 쿼리 문자열 내에 변수를 작성할 경우에는
템플릿 리터럴 대신 knex의 raw 메서드가 제공하는 방식을 따라야 한다. [raw 메서드 공식문서](https://knexjs.org/#Raw)
