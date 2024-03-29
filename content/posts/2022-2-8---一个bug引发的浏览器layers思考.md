---
title: 一个bug引发的浏览器layers思考
date: "2022-2-7"
template: "post"
draft: false
slug: "/post/browser-layers"
category: "JAVASCRIPT"
tags:
  - "JAVASCRIPT"
description: "一个bug引发的浏览器layers思考"
socialImage: "/media/42-line-bible.jpg"
---

最近遇见一个奇怪的bug，当chrome更新版本后，会出现如下问题

当打开抽屉后，页面中的title会消失，审查元素发现：title区域是存在的，没有display：none的情况，当调整窗口大小或者toggle某个css属性的时候，title会再次复现。
第一次发现这个问题的时候，毫无头绪，不知道怎么去想，之后比较了一下其他抽屉，当抽屉里的内容只有一屏展示的时候，不会出现此类问题，再回来看上诉的情况，已经不是一屏展示。
于是找到父元素身上有个overflow：auto选项，去掉这个css属性果然就好了，至此问题解决没有深究。  

第二次出现这个问题，是同事解决冲突的时候把overflow：auto给干回去了，测试同学发现报到我这里，刚好在这之前看了一篇文章：[https://mp.weixin.qq.com/s/gbYD59ZdJmUrTdtveLVB6w](https://mp.weixin.qq.com/s/gbYD59ZdJmUrTdtveLVB6w)，就想看看在层这个方面看下这里是怎么展示的，不看不知道，一看一分析才知道怎么回事：在overflow：auto元素身上使用的有vue loading指令，loading指令会在
元素身上添加的有特定的class名，当形成layers层的时候，layers层会包含这个名称命名，当loading消失之后，class名会自动去掉，所以形成的layers层名称与html元素对不上号，导致title不展示。  

接着又去safari验证一下，发现Safari在形成layers层的时候不会有loading的class名，所以在Safari不会出现此bug。

思考：难道是因为去掉class之后元素形成的层都会不存在？创建了一个最小demo,发现并不是，刚开始layer的命名是div1div2，去掉div2之后layer的命名恢复成div1
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<style>
    .div1{
        width: 100px;
        height: 400px;
        overflow: auto;
        border:1px solid #000;
    }
    .div2{
        position: relative;
    }
    .child{
        height: 800px;
    }
</style>
<body>
    <div class="div1">
        <div class="child">11</div>
    </div>
    <script>
        const div1 = document.querySelector('.div1');
        div1.className = `${div1.className} div2`
        setTimeout(()=>{
            div1.className = 'div1';
        },2000)
    </script>
</body>
</html>

```
最后：chrome有新版本了，顺手更新发现此bug无，5555555，看来是chrome的渲染问题呢

