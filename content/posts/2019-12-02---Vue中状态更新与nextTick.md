---
title: Vue更新状态与nextTick之间的联系？
date: "2019-12-03"
template: "post"
draft: false
slug: "/post/vueStatusAndNextTick/"
category: "Vue"
tags: 
    - "Vue"
description: "在React中setState改变React的状态值，若在改变之后立即去取被更新的状态发现还是原来的值，这是因为setState是异步的，所以在React中要想在改变状态之后立即获取状态，只能通过两种方式，一种是在setState的回调当中去取，另外一种是在componentDidupdate。在Vue当中，状态的改变是同步的，上一步我进行了状态的改变，下一步我能获取到状态值。"
socialImage: "/media/42-line-bible.jpg"
---
在React中setState改变React的状态值，若在改变之后立即去取被更新的状态发现还是原来的值，这是因为setState是异步的，所以在React中要想在改变状态之后立即获取状态，只能通过两种方式，一种是在setState的回调当中去取，另外一种是在componentDidupdate。在Vue当中，状态的改变是同步的，上一步进行了状态的改变，下一步能获取到状态值。那么在Vue当中是不是每一次改变状态值，都会触发DOM渲染更新呢？答案肯定是否定的，这样既不高效也耗性能。所以如果是多次改变状态，只会触发DOM更新一次。在这之前我们需要了解一下nextTick的实现。

### nextTick
nextTick：在DOM更新循环结束之后执行延迟回调。为了便于理解，nextTick的代码我剔除掉了一些判断条件，大致的主线如下所示。
大概的意思就是nextTick其实就是维护了一个闭包的数组。这个数组放在微任务队列当中去执行。
```
var nextTick = (function () {
    // 维护传入nextTick中的回调
    var callbacks = [];
    // 状态用来维护微任务
    var pending = false;
    var timerFunc;
    // 在promise.then中需要执行的函数
    function nextTickHandler () {
        pending = false;
        var copies = callbacks.slice(0);
        console.log(copies);
        callbacks.length = 0;
        for (var i = 0; i < copies.length; i++) {
            copies[i]();
        }
    }
    // 使用浏览器支持的Promise
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        var p = Promise.resolve();
        var logError = function (err) { console.error(err); };
        timerFunc = function () {
            // 当本轮宏任务执行完毕，一次执行callback中的函数
            p.then(nextTickHandler).catch(logError);
        };
    } 
    // nextTick实际就是这个函数，cb回调，ctx上下文指向，多次调用多次push函数。
    return function queueNextTick (cb, ctx) {
        console.log(cb);
        callbacks.push(function (i) {
            if (cb) {
                try {
                    cb.call(ctx, i);
                } catch (e) {
                    handleError(e, ctx, 'nextTick');
                }
            } 
        });
        // 第一次nextTick调用的时候初始化一个promise.then，下一次调用就不走这里了
        if (!pending) {
            pending = true;
            timerFunc();
        }
  }
})();

```

### vue内部Watcher更新走的的是nextTick

```
nextTick(flushSchedulerQueue);

function flushSchedulerQueue (i) {
  console.log(i)
  flushing = true;
  var watcher, id;
  queue.sort(function (a, b) { return a.id - b.id; });

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    // 调用watcher.run 实现更新
    watcher.run();
  }
}
```

在Vue中更新状态后，视图立马会得到响应并进行渲染。这时候如果使用nextTick传入的回调函数进行简单操作，页面视图更新是不会有卡顿现象发生的。但是如果在回调中做大量的计算，会发现在页面中Dom是真真实实的更新了，可是视图并没有渲染。这是因为在nextTick添加的回调和flushSchedulerQueue在同一个数组当中。执行顺序是依次执行，若nextTick当中有大量的代码阻塞主线程，必然会影响页面的渲染。最好的解决办法是使用setTimeout。   

下面附张图。当改变状态后添加nextTick的内部表现
1.  添加flushSchedulerQueue回调进行视图更新
2.  手动添加的nextTick回调
3.  nextTick当中的callback包含两个回调，依次执行

![nextTick.jpg](/media/nextTick.jpg)
