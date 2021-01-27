---
title: React hooks与class component的优化点
date: "2020-9-09"
template: "post"
draft: false
slug: "/post/about-react-hooks"
category: "React"
tags:
  - "React"
description: "接触 React 也有快一年的时间了，在项目使用的过程当中，遇见了很多问题，其中有三个显著性的问题，在 React 的官方文档中介绍为什么引入 hooks 原因中有提及到。[戳这里读原文链接](https://reactjs.org/docs/hooks-intro.html)，下面以这几个问题为切入点，来谈谈我的感受。"
socialImage: "/media/42-line-bible.jpg"
---

接触 React 也有快一年的时间了，在项目使用的过程当中，遇见了很多问题，其中有三个显著性的问题，在 React 的官方文档中介绍为什么引入 hooks 原因中有提及到。[戳这里读原文链接](https://reactjs.org/docs/hooks-intro.html)，下面以这几个问题为切入点，来谈谈我的感受。

### 一、components 之间很难复用状态的逻辑

尽管 React 官方文档告诉我们你可以使用 HOC 函数以及 renderProps 来进行逻辑的抽离。在我看来，在进行 HOC 操作的时候，你事先得想好 HOC 容器中哪些状态值是需要维护的，哪些接受到的 props 值是需要透传下去，在想的这个过程是逆向的去构建 HOC，想着想着，头就秃了 👴，我是觉得这种形式对新手不友好，就像洋葱模型一样。
例如：
在这两张图片中，设计样式不一样，但是交互以及逻辑代码是一致的，这时候就需要使用一种抽离逻辑的方式来处理这段细节，在这里我选择了使用 HOC 的形式。代码如下：

![reacthooks9.jpg](/media/reacthooks3.jpg)

![reacthooks9.jpg](/media/reacthooks4.jpg)

最终使用的方式是`DataRangeSelectHoc(SelectTalentPool)`。设想现在如果我只是得到上面图片中的某一个需求，第一次实现了一组件，第二次接手类似的需求，em~，首先把相同的逻辑抽离出来这一步没问题，紧接着需要创建一个 HOC 来承担这部分逻辑，接着去改造原组件的传参逻辑以及组件结构，这些都是没问题的。但是这里会多出一层 container 去包裹组件，当 HOC 层架过多时候，容易形成 wrapper hell，同时另外一个点就是，最里面的组件接受的 部分 props 都是通过 container 透传过来的，有时候新增 props 时往源头注入，尽头去取，常常会忘了中间这一层进行透传。接着我们使用 hooks 来重写上面这部分代码，代码见下图

![reacthooks9.jpg](/media/reacthooks11.jpg)

![reacthooks9.jpg](/media/reacthooks10.jpg)

首先组织结构上来说要清晰一些，没有了中间层，逻辑也更加清晰了，哪些是直接使用封装好的 state，哪些是需要父组件穿进来的 state。另外一点就是当之前写的 stateless component，现在因为需求需要引入 state，hooks 没出现之前你只能将 stateless component 改写为 class component。

### 二、复杂的 components 变得越来越难理解

具体表现在：逻辑散落在各个生命周期函数中，以及一个生命周期函数中包含几段不相干的逻辑的代码。例如在 componentDidMount 中需要去后台获取数据，为 DOM 添加事件监听，在 componentWillUnmount 中清除掉事件监听。像这种相互有联系的代码存在在一个组件中的不同地方，没有相互联系的代码在一个生命周期函数中出现。在 hooks 当中，你可以自定义不同的 hooks 负责不同的逻辑，且把相关的逻辑代码组织起来一处管理，这样逻辑代码耦合在一起，清晰且易于理解。

### 三、class 类组件困扰开发人员以及机器

在进公司上手开发项目的时候，注意到在类组件中使用 bind 去绑定事件函数的 this 指向，当类组件足够大的时候，constructor 内部一长串 bind，下面展示 constructor 中部分 bind，

![reacthooks8.jpg](/media/reacthooks6.jpg)

这样一看，放眼望去，嗯，关闭当前文件，跑路吧~。主要是 js 中的 this 和其他语言的 this 不太一样，所以对后端语言的开发者来说需要花时间去理一理。看了一下早期的工具函数中还有对于 this 有一个专门处理的函数，见下图，

![reacthooks9.jpg](/media/reacthooks7.png)

![reacthooks9.jpg](/media/reacthooks9.jpg)

看到这些，再看到 react 为什么要出 hooks 原因的时候，能理解他们想改变的痛点，毕竟他们遇到的我们也遇到了。其次还有就是机器在对 class 类进行编译的时候，存在 component folding，ahead-of-time compilation of component 的问题，以及类组件不能很好的压缩，在热加载的时候也有问题（flaky and unreliable）, 不利于持续性优化。来自

> However, we found that class components can encourage unintentional patterns that make these optimizations fall back to a slower path.

所以为什么 react hooks 的出现，是为了让你在函数式组件中也能进行状态管理，同时函数式组件在底层代码编译上优化比 React class 类表现要更胜一筹。

总结：相比传统 class component，hooks 的优点

1. 逻辑更好的抽离
2. 生命周期函数相关逻辑代码不散乱
3. 利于底层编译优化

在使用 hooks 需要注意两点：

1. 不要在一般函数里面使用 hooks
2. 不能在条件语句，循环语句，嵌套函数中使用 hooks

同时在 class component 中，官方文旦给我们提供了另外两种对组件进行优化的方法：Render Props、Composition，renderProps 其实和 HOC 差不多，算是对逻辑进行抽离的另外一种形式，换汤不换药。最近在 review 业务过程中，刚好发现 composition 可以进行一次代码优化。

![reacthooks9.jpg](/media/reacthooks12.jpg)

![reacthooks9.jpg](/media/reacthooks13.jpg)

![reacthooks9.jpg](/media/reacthooks14.jpg)

上面几张图展示经过时间推移对一个需求衍生出来了三个版本，其中有一个完全相同的功能点在于图中的节点在一个容器组件中，点击右上角三个 icon，分别会定外节点到屏幕中心位置，放大节点，缩小节点。这三个版本每个版本都 copy 出来了这样一个容器组件去呈节点，并且每个容器中都出现了不同的业务代码。但是相同的代码多了，说明就要想方设法的去做优化了。利用 composition，我是这样做的。
引入节点组件，把在容器组件中关于节点组件的业务代码抽离到上层组件中，这样不仅抽离容器组件是一个公用组件外，同时还解决了容器组件透传某些 props 值

![reacthooks9.jpg](/media/reacthooks16.jpg)

使用容器组件，把当前节点组件通过 prop 传递进去

![reacthooks9.jpg](/media/reacthooks17.jpg)

容器组件使用

![reacthooks9.jpg](/media/reacthooks15.jpg)

以上大概就是我总结的点，同时 温故而知新.....
