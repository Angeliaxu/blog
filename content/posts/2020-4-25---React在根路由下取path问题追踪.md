---
title: React在根路由下取path问题追踪上
date: "2020-04-25"
template: "post"
draft: false
slug: "/post/Webpack/"
category: "React"
tags:
  - "js"
description: ""
socialImage: "/media/42-line-bible.jpg"
---

问题激发兴趣，兴趣激发行动。本文所讨论的 React 版本 15.6.2,React-router 为 2.8.1。  
故事背景：产品的需求是在当前页面离开到其他页面的时候，来一个挽留弹窗。看似简单的需求，但是踩了一天的坑，最后虽然解决了问题，但是不知道问题是从何而来，为什么会产生这样的问题，是 React-router 自带的有 bug，还是项目中各种山路十八弯的转导致的问题，接下来就细细的品吧。

### 怎么在 React 中实现一个挽留弹窗

现在 react-router 已经升级到版本 5 了，项目中使用的是 2 版本，在 2 版本中，react-router 给开发者定义了路由钩子函数，可以让开发者去自定义在钩子函数当中做具体的操作。 开发人员通过 WithRouter 包裹下当前组件，使用 this.props.router.setRouteLeaveHook API 来定义路由切换之前的行为。第一个参数是当前组件所在的路由情况，第二个参数为自定义函数。具体代码实现如下

```
this.props.router.setRouteLeaveHook(
  this.props.route,
  this.routerWillLeave
);
```

接下实现 this.routerWillLeave

```
routerWillLeave = (nextLocation) => {

    return false;
  };
```

当切换路由时，页面行为应该按照代码设置的那样，不管点击哪里，都应该停留在当前页面，可它......完全不受掌控，跳走了 WTF！！！
和其他页面对比了下写法，一模一样，但是路由设置那里却不一样，见下图

![ReactLeaveRoute1.png](/media/ReactLeaveRoute1.jpg)

其他组件正常起效果写法
![ReactLeaveRoute2.png](/media/ReactLeaveRoute2.jpg)

上面代码提到的 this.props.route，在第一张图片中打印出来路由 path 是**/**，第二张打印出来是**:jobId**。可是页面路由明明分别是/tanlent-pool-mapping-graph 和/jobs/:jobId。所以只要跟路由下的一级路由匹配的组件拦截路由都不能成功，因为每个一级路由匹配的组件下取当前路由都是/，在此例中一级路由之间的跳转，都不可能做到拦截处理。感觉有违常理，凭什么一级路由下就不能做拦截处理了。由此猜想：**_react-router 中路由拦截是拿目标路由与当前路由做比较，两者不一样，就做拦截处理。_**为了解决疑惑点，开始从源头开始往下看吧，看路由这一块是怎么实现的。

经过 debugger 发现，Router 组件其实是使用 RouterContext 这个文件把 props 注入到 component 里面去的，详细代码如下
![RouterContext.jpg.png](/media/RouterContext.jpg)

可以看到，Router 组件既给我们传递了 route 还传递了 routes，仔细看 route 的取值，其实也是从 routes 中根据当前组件的索引去取该组件对应的路由。嗯，这里没有错，那为啥为在我的组件里面取到的是根路由呢？
![route.png](/media/route.png)

再来看看 components 是什么，这里的 components 和上面的 index 没有关系，之前还以为是在取 index 的时候，route 给取错了，导致传递下去的 route 也是错的，现在看来并不是，接下来的步骤到传递给组件的 route 都是对的

![components.png](/media/components.png)

这里的 components 是在/tanlen-pool-mapping-graph 路由下使用到的组件，通过 for 循坏这可以看见分别以这个组件模板创建了新的 react 组件，在这里 route 挂载在 props 下的，route 还是/tanlent-pool-mapping-graph。

![element.png](/media/element.png)

最终 RouterContext 这个文件返回出来的是一个 react 元素，里面包含了 props，props 里面又有需要渲染的 react 组件元素。最终在哪儿用到这个元素暂时还没 debugger 下去，
接下来需要看这段代码是在哪儿用到了，以及中间做了什么操作，导致在组件里面取 route 是错的，从目前看来，多半是项目里面某个地方使用错误导致这个 bug。时间有限，请等待下一部分的完成。
