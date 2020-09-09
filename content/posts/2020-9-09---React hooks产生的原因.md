---
title: React hooks产生的原因
date: "2020-9-09"
template: "post"
draft: false
slug: "/post/about-react-hooks"
category: "React"
tags:
  - "React"
description: "实现instanceof，new操作符"
socialImage: "/media/42-line-bible.jpg"
---

接触 React 也有快一年的时间了，在这段期间使用的过程当中，遇见了很多问题，其中有三个显著性的问题，在 React 的官方文档中介绍为什么引入 hooks 原因中有提及到这几个问题。[戳这里读原文链接](https://reactjs.org/docs/hooks-intro.html)，下面以这几个问题为切入点，来谈谈我的感受。

### 一、components 之间很难复用状态的逻辑

尽管 React 官方文档告诉我们你可以使用 HOC 函数以及 renderProps 来进行逻辑的抽离，但是在真正的使用过程当中，会发现有些地方令人头秃。
例如：
在这两张图片中，设计样式不一样，但是交互以及逻辑代码是一致的，这时候就需要使用一种抽离逻辑的方式来处理这段细节，在这里我选择了使用 HOC 的形式。代码参见如下：

使用起来的方式也不过是`DataRangeSelectHoc(SelectTalentPool)`如此简单。设想现在如果我只是得到上面图片中的某一个需求，埋头苦干的实现了一组件，第二天接手类似的需求，em~，首先把相同的逻辑抽离出来这一步没问题，紧接着需要创建一个 HOC 来承担这部分逻辑，一般遇见这种情况都是抽离出来一个公用函数，需要的时候调就行了。现在是在 HOC 这一步出现了问题，关键是还得返回一个 Class 类来做一个容器，若是对一位新手开发人员，我觉得这是不容易掌握的点，所以这就是为什么 hooks 出现的原因之一。接着我们使用 hooks 来重写上面这部分代码，对比看看有什么优势，代码见下图

### 二、复杂的 components 变得越来越难理解

具体表现在：逻辑散落在各个生命周期函数中，以及一个生命周期函数中包含几段不相干的逻辑的代码。例如在 componentDidMount 中需要去后台获取数据，为 DOM 添加事件监听，在 componentWillUnmount 中清除掉事件监听。像这种相互有联系的代码存在在一个组件中的不同地方，没有相互联系的代码在一个生命周期函数中出现。在 hooks 当中，你可以自定义不同的 hooks 负责不同的逻辑，且把相关的逻辑代码组织起来一处管理，这样逻辑代码耦合在一起，清晰且易于理解。

### 三、class 类组件困扰开发人员以及机器

在进公司上手开发项目的时候，注意到在类组件中使用 bind 去绑定事件函数的 this 指向，当类组件足够大的时候，constructor 内部一长串 bind，下面展示 constructor 中部分 bind，

这样一看，放眼望去，嗯，关闭当前文件，跑路吧~。主要是 js 中的 this 和其他语言的 this 不太一样，若是一位后端人员来写，一定会黑人问号脸吧。看了一下早期的工具函数中还有对于 this 有一个专门处理的函数，见下图，当我看到这些，再看到 react 为什么要出 hooks 原因的时候，能理解他们想改变的痛点，毕竟他们遇到的我们也遇到了。其次还有就是机器在对 class 类进行编译的时候，存在 component folding，ahead-of-time compilation of component 的问题，以及类组件不能很好的压缩，在热加载的时候也有问题（flaky and unreliable）, 不利于持续性优化。来自

> However, we found that class components can encourage unintentional patterns that make these optimizations fall back to a slower path.

所以为什么 react hooks 的出现，是为了让你在函数式组件中也能进行状态管理，同时函数式组件在底层代码编译上比 React class 类表现要更胜一筹。

上面提到了 component folding 以及 ahead-of-time compilation of component，还是了解一下下
