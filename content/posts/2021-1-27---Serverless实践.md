---
title: Serverless实践
date: "2020-9-15"
template: "post"
draft: false
slug: "/post/about-serverless"
category: "JAVASCRIPT"
tags:
  - "JAVASCRIPT"
description: "serverless：使开发者在云端开发，使用Faas的方式快速进行服务的搭建，相比于传统的服务器，serverless省去了运维，部署，购买服务器这一系列操作，使开发者更专注于业务开发，对于前端开发人员说，轻松不少。"
socialImage: "/media/42-line-bible.jpg"
---

### 概念

serverless：使开发者在云端开发，使用 Faas 的方式快速进行服务的搭建，相比于传统的服务器，serverless 省去了运维，部署，购买服务器这一系列操作，使开发者更专注于业务开发，对于前端开发人员说，轻松不少。

### 实战：定时推送器

故事发生背景：我司每周都轮流有 TL 操作合并分支，每周一的时候就有同学会问，这周的 merger 是谁？有时 TL 还需要相互沟通一下才能推断出本周 merger，因此产生出写一个脚本想法，每到周一的时候在群里通知大家本周 merger。
解决问题：降低沟通成本，信息透明化
技术栈：serverless+webhook
前端小组使用的沟通工具是企业微信，企业微信可为每个群提供 robot 机器人，通过创建一个机器人获取到该机器人的 webhook，定时向这个 webhook 发送请求通知到微信群。具体 webhook 参数可参考链接。接下来就需要一个定时触发器，这里选用的是阿里云的云函数。

1. 建立配置文件 config.js

```
"use strict";
/*
To enable the initializer feature (https://help.aliyun.com/document_detail/156876.html)
please implement the initializer function as below：
exports.initializer = (context, callback) => {
  console.log('initializing');
  callback(null, '');
};
*/
let index = 0;
const names = [1,  2, 3, 4];
const startDate = new Date('1970/01/01');
const endDate = new Date(new Date().toLocaleDateString()).getTime();
const gap =  Math.floor(((endDate - startDate.getTime()) / (1000 * 60 * 60 * 24))/7);
index = gap % names.length;

const config = {
    本周merger: names[index] ,
};
let content = "## 提醒 \n";
Object.entries(config).forEach(([key, value]) => {
  content += `>**${key}:** [${value}](${value}) \n\n`;
});
const params = {
  msgtype: "markdown",
  markdown: {
    content,
  },
};
module.exports = params;
```

2.建立函数触发文件入口，阿里云函数函数的入口是 exports.handler，所以需要触发的代码逻辑都是在这里面，这里在写的时候需要注意一下 callback 的执行表示该云函数是否执行完毕。之前同步发送请求并且 callback，导致请求一直未发送出去。

```
"use strict";
/*
To enable the initializer feature (https://help.aliyun.com/document_detail/156876.html)
please implement the initializer function as below：
exports.initializer = (context, callback) => {
  console.log('initializing');
  callback(null, '');
};
*/
exports.handler = (event, context, callback) => {
    const params = require("./config");
    const https = require("https");
    const options = {
        hostname: '......',
        path: '........',
        method: 'POST',
        headers:{
             'Content-Type': 'application/json'
        }
    }
    const req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            callback(null);
        });
    });
    req.on('error', function (e) {
         callback(e);
    });
    req.write(JSON.stringify(params));
    req.end();
};
```

3.  逻辑写好之后，就需要定时去触发这个函数，需要对函数添加定时触发器
    创建触发器完成，需要配置触发时机 cron 表达式，阿里云有详细的文档介绍，这里配置的是每周一早上 10 点触发一次，如图所示，每周一老铁儿子就会提醒：周一啦，大家快起来搬砖....
    ![serverless-result.jpg](/media/serverless-result.jpg)
