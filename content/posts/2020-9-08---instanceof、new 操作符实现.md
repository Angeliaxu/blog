---
title: 实现instanceof，new操作符
date: "2020-9-08"
template: "post"
draft: false
slug: "/post/about-instanceof-new"
category: "JavaScript"
tags:
  - "basic JavaScript"
description: "实现instanceof，new操作符"
socialImage: "/media/42-line-bible.jpg"
---

了解 js 原生 api 的实现，有助于巩固 js 当中的一些理论知识，接下来就需要手动实现 instanceof，new 操作符

### new

要实现 new 操作符，首先得想想 new 操作符做了什么，有了思路比较好写符合预期的代码

1.  new 操作符的时候，函数内部的 this 进行了绑定
2.  生成了一个对象，并且改变这个对象的原型链指向
3.  最终返回生成好的对象

所以，代码如下，很简单

```
function new(fn,...args) {
  let obj = Object.create(fn.prototype);
  let result = fn.apply(obj, args);
  obj = Object.prototype.toString.call(result) === '[object Object]' ? result : obj
  return obj;
}
```

### instanceof

instanceof 的思路也是很简单，主要也是利用原型链一层一层的向上查找，直到查找不到为止

实现代码如下：

```
function instanceof(current,target) {
  let proto = current.__proto__;
  let prototype = target.prototype;
  let bool = false;
  while(proto){
    if (proto === prototype){
      bool=true;
      break;
    }else {
      proto = proto.__proto__;
    }
  }
}
```
